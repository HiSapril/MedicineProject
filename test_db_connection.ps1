
function Test-SqlConnection {
    param ($password)
    $connString = "Server=127.0.0.1,14330;Database=master;User Id=sa;Password=$password;TrustServerCertificate=True;Encrypt=False;"
    $conn = New-Object -TypeName System.Data.SqlClient.SqlConnection
    $conn.ConnectionString = $connString

    try {
        Write-Host "Attempting connection with password: $password"
        $conn.Open()
        Write-Host "SUCCESS! Password is correct." -ForegroundColor Green
        $conn.Close()
        return $true
    }
    catch {
        if ($_.Exception.InnerException -is [System.Data.SqlClient.SqlException]) {
            $ex = $_.Exception.InnerException
            Write-Host "FAILED. Error: $($ex.Message) (Number: $($ex.Number), State: $($ex.State))" -ForegroundColor Red
        }
        else {
            Write-Host "FAILED. Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}


Test-SqlConnection "Student_12345"
Test-SqlConnection "MySuperPwd123!"

# Test new user
$connStringApp = "Server=127.0.0.1,14330;Database=master;User Id=appuser;Password=AppUser_123;TrustServerCertificate=True;Encrypt=False;"
$connApp = New-Object -TypeName System.Data.SqlClient.SqlConnection
$connApp.ConnectionString = $connStringApp
try {
    Write-Host "Attempting connection as appuser..."
    $connApp.Open()
    Write-Host "SUCCESS! AppUser connected." -ForegroundColor Green
    $connApp.Close()
}
catch {
    Write-Host "FAILED AppUser. Error: $($_.Exception.Message)" -ForegroundColor Red
}
