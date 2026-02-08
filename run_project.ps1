# Automation Script for Elderly Care Reminder System

Write-Host "--- Bắt đầu thiết lập hệ thống Elderly Care ---" -ForegroundColor Cyan

# 0. Kiểm tra thư mục gốc
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "LỖI: Bạn phải chạy script này từ thư mục gốc của project (MedicineProject)" -ForegroundColor Red
    exit
}

# 1. Khởi động hạ tầng Docker
Write-Host "`n[1/4] Đang khởi động Docker (SQL Server, RabbitMQ, Redis)..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "LỖI: Không thể khởi động Docker. Hãy đảm bảo Docker Desktop đang chạy." -ForegroundColor Red
    exit
}

Write-Host "Vui lòng đợi 30 giây để SQL Server khởi động hoàn tất..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 2. Cài đặt công cụ Migrations nếu chưa có
Write-Host "`n[2/4] Kiểm tra công cụ Entity Framework..." -ForegroundColor Yellow
dotnet tool install --global dotnet-ef 2>$null

# 3. Chạy Migrations cho các Service
$services = @("AuthService", "MedicationService", "AppointmentService", "HealthTrackingService", "ReminderService")

Write-Host "`n[3/4] Đang cập nhật Database cho các service..." -ForegroundColor Yellow
foreach ($service in $services) {
    Write-Host "--- Processing $service ---" -ForegroundColor Green
    $path = "backend/$service"
    
    # Xóa thư mục Migrations cũ nếu có
    if (Test-Path "$path/Migrations") { Remove-Item -Path "$path/Migrations" -Recurse -Force }
    
    dotnet restore $path
    dotnet ef migrations add InitialCreate --project $path --output-dir Migrations
    
    # Retry loop cho database update
    $maxRetries = 5
    $retryCount = 0
    $success = $false
    
    while (-not $success -and $retryCount -lt $maxRetries) {
        $retryCount++
        try {
            dotnet ef database update --project $path
            if ($LASTEXITCODE -eq 0) {
                $success = $true
            }
            else {
                Write-Host "Thử lại lần $retryCount/$maxRetries cho $service..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            }
        }
        catch {
            Write-Host "Lỗi khi cập nhật DB cho $service. Đang thử lại..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    if (-not $success) {
        Write-Host "LỖI: Không thể cập nhật Database cho $service sau $maxRetries lần thử." -ForegroundColor Red
    }
}

# 4. Khởi chạy tất cả Service trong cửa sổ mới
Write-Host "`n[4/4] Đang khởi chạy các microservices trong cửa sổ mới..." -ForegroundColor Yellow

$allServices = @("ApiGateway", "AuthService", "MedicationService", "AppointmentService", "HealthTrackingService", "ReminderService")

foreach ($s in $allServices) {
    Write-Host "Starting $s..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- $s is starting ---'; cd backend/$s; dotnet run"
}

# 5. Khởi chạy Web App
Write-Host "`n[*] Đang khởi chạy Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- Web App is starting ---'; cd web-app/elderly-care-web; npm run dev"

# 6. Kiểm tra trạng thái hệ thống
Write-Host "`n--- Kiểm tra trạng thái hệ thống (Vui lòng đợi 10s)... ---" -ForegroundColor Cyan
Start-Sleep -Seconds 10

$ports = @{
    "ApiGateway"            = 5041;
    "AuthService"           = 5004;
    "MedicationService"     = 5002;
    "AppointmentService"    = 5001;
    "HealthTrackingService" = 5003;
    "ReminderService"       = 5005;
    "Frontend"              = 5173
}

$allOk = $true
foreach ($name in $ports.Keys) {
    $port = $ports[$name]
    $check = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet
    if ($check) {
        Write-Host "[OK] $name đã hoạt động tại cổng $port" -ForegroundColor Green
    }
    else {
        Write-Host "[LỖI] $name KHÔNG phản hồi tại cổng $port" -ForegroundColor Red
        $allOk = $false
    }
}

if ($allOk) {
    Write-Host "`n--- THIẾT LẬP HOÀN TẤT! ---" -ForegroundColor Cyan
    Write-Host "Mọi thứ đã sẵn sàng. Bạn có thể truy cập http://localhost:5173" -ForegroundColor White
}
else {
    Write-Host "`n--- CẢNH BÁO: Một số dịch vụ chưa khởi động kịp! ---" -ForegroundColor Yellow
    Write-Host "Vui lòng kiểm tra các cửa sổ PowerShell vừa mở để xem lỗi cụ thể." -ForegroundColor White
}
