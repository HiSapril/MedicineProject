using ReminderService.Models.DTOs;

namespace ReminderService.Services;

public interface INotificationClient
{
    Task SendNotificationAsync(CreateNotificationDto notification);
}

public class NotificationClient : INotificationClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NotificationClient> _logger;
    private readonly string _notificationServiceUrl;

    public NotificationClient(
        HttpClient httpClient, 
        IConfiguration configuration,
        ILogger<NotificationClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _notificationServiceUrl = configuration["NotificationServiceUrl"] ?? "http://localhost:5006";
    }

    public async Task SendNotificationAsync(CreateNotificationDto notification)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                $"{_notificationServiceUrl}/api/notifications/internal", 
                notification);

            if (!response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to send notification. Status: {StatusCode}, Content: {Content}", 
                    response.StatusCode, content);
            }
            else
            {
                _logger.LogInformation("Successfully sent notification for reminder {ReminderId}", 
                    notification.SourceReminderId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending HTTP request to NotificationService");
        }
    }
}
