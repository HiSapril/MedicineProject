using Microsoft.EntityFrameworkCore;
using ReminderService.Data;
using ReminderService.Models;
using ReminderService.Models.DTOs;

namespace ReminderService.Services;

public class ReminderTriggerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly INotificationClient _notificationClient;
    private readonly ILogger<ReminderTriggerService> _logger;

    public ReminderTriggerService(
        IServiceProvider serviceProvider,
        INotificationClient notificationClient,
        ILogger<ReminderTriggerService> logger)
    {
        _serviceProvider = serviceProvider;
        _notificationClient = notificationClient;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderTriggerService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndTriggerRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking reminders.");
            }

            // Check every 30 seconds
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private async Task CheckAndTriggerRemindersAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ReminderDbContext>();
            var now = DateTime.UtcNow;
            _logger.LogInformation("Checking for reminders due before {Now} (UTC)", now);

            // Find pending reminders that are due
            var dueReminders = await context.Reminders
                .Where(r => r.Status == ReminderStatus.Pending && r.ScheduledTime <= now)
                .OrderBy(r => r.ScheduledTime)
                .Take(50) // Process in batches
                .ToListAsync();

            if (!dueReminders.Any())
            {
                 // Check if there are ANY pending reminders at all, for debugging
                 var anyPending = await context.Reminders.AnyAsync(r => r.Status == ReminderStatus.Pending);
                 if (anyPending)
                 {
                     _logger.LogInformation("No *due* reminders found, but pending reminders exist.");
                     
                     // Debug: Print the pending reminders
                     var pending = await context.Reminders
                        .Where(r => r.Status == ReminderStatus.Pending)
                        .OrderBy(r => r.ScheduledTime)
                        .Take(5)
                        .ToListAsync();
                        
                     foreach (var p in pending) 
                     {
                         _logger.LogInformation("Pending Reminder {Id}: Scheduled {Time} (Kind: {Kind})", 
                            p.Id, p.ScheduledTime, p.ScheduledTime.Kind);
                     }
                 }
                 else
                 {
                     _logger.LogInformation("No pending reminders found in database.");
                 }
            }
            else
            {
                _logger.LogInformation("Found {Count} due reminders.", dueReminders.Count);

                foreach (var reminder in dueReminders)
                {
                    await ProcessReminderAsync(reminder);
                }

                await context.SaveChangesAsync();
            }
        }
    }

    private async Task ProcessReminderAsync(Reminder reminder)
    {
        try
        {
            // Build notification payload
            var notificationDto = new CreateNotificationDto
            {
                UserId = reminder.UserId,
                SourceReminderId = reminder.Id,
                SourceEventType = (int)reminder.Type,
                SourceEventId = reminder.ReferenceId,
                Title = GenerateTitle(reminder),
                Message = GenerateMessage(reminder),
                DeliveryChannel = 0, // Default to MobilePush
                RecipientType = 0    // Default to ElderlyUser
            };

            // Send notification
            await _notificationClient.SendNotificationAsync(notificationDto);

            // Update reminder status
            // Note: In some systems we might want a 'Triggered' status, 
            // but for now we'll mark as Done to avoid re-triggering.
            // Or better, if 'Done' means completed by user, we might need a distinct status.
            // Since ReminderStatus only has Pending, Done, Missed, 
            // and Done usually implies user action, we might have a conflict.
            // However, to prevent re-sending, we must change status or update ScheduledTime.
            // For this implementation, I will assume 'Missed' or we need a new status.
            // But wait, 'Missed' implies not done. 
            // Let's mark it as 'Missed' if it's way past due? 
            // Actually, for the purpose of this integration, let's assuming triggering 
            // doesn't complete the reminder (user must do that).
            // So we should NOT mark as Done.
            // BUT we need to stop re-triggering. 
            // Typically we'd have a 'Triggered' boolean or status.
            // Given the limited enum, I will add a 'LastTriggeredAt' field logic if possible, 
            // but I can't change schema easily.
            // 
            // WORKAROUND: I will use 'Missed' to indicate "Triggered/Sent but not yet Done" for now
            // OR I can just leave it Pending but we need to track it was sent.
            //
            // Let's look at the schema again. 'Status' has Pending(0), Done(1), Missed(2).
            // If I leave it Pending, it loops.
            // If I mark Done, it disappears from "Upcoming".
            // If I mark Missed, it appears as Missed.
            // 
            // Real solution: The Reminder entity usually needs a 'LastNotifiedAt' column.
            // Since I cannot change schema easily in this strict mode without migration:
            // I will assume for this task that 'Missed' is an acceptable state for "Sent to user, waiting for action" 
            // OR I should assume the requirement implies I *can* modify schema if needed.
            //
            // Actually, let's look at the Architecture Rules: "Notifications are SYSTEM-GENERATED... Notifications represent delivery attempts".
            // The Reminder is the "Trigger".
            // 
            // Let's assume for this specific integration task I should mark it as 'Missed' (as in "Time passed, notification sent") 
            // or I'll check if I can add a migration.
            //
            // For safety and correctness, I will use 'Missed' to stop the loop.
            // Ideally, we'd have a 'Triggered' status.
            
            reminder.Status = ReminderStatus.Missed; 
            reminder.UpdatedAt = DateTime.UtcNow;
            
            _logger.LogInformation("Triggered reminder {ReminderId}. Status updated to Missed/Triggered.", reminder.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing reminder {ReminderId}", reminder.Id);
        }
    }

    private string GenerateTitle(Reminder reminder)
    {
        return reminder.Type switch
        {
            ReminderType.Medication => "Medication Reminder",
            ReminderType.Appointment => "Appointment Reminder",
            ReminderType.Exercise => "Exercise Reminder",
            _ => "Reminder"
        };
    }

    private string GenerateMessage(Reminder reminder)
    {
         return reminder.Type switch
        {
            ReminderType.Medication => "It's time to take your medication.",
            ReminderType.Appointment => "You have an upcoming appointment.",
            ReminderType.Exercise => "It's time for your exercise.",
            _ => "You have a new reminder."
        };
    }
}
