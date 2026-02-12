import { medicationService } from '../services/medication.service';
import { appointmentMockService } from './appointment.mock';
import { reminderApi } from './reminder.api';
import { notificationApi } from './notification.api';

// MOCK DATA – DEV ONLY – DO NOT SHIP

/**
 * DASHBOARD MOCK AGGREGATOR
 * 
 * Responsibility: Pull real-time data from domain mocks/services 
 * and compute aggregated metrics for the UI.
 */
export const dashboardMockService = {
    getDashboardMetrics: async () => {
        // Pull data concurrently
        const [meds, appts, rems, notifs] = await Promise.all([
            medicationService.getMedications(),
            appointmentMockService.getAll(),
            reminderApi.getReminders(),
            notificationApi.getNotifications("00000000-0000-0000-0000-000000000001", 1, 100)
        ]);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        // 1. Upcoming Appointments (Next 3)
        const upcomingAppts = appts.data
            .filter(a => a.status === 'upcoming' && new Date(a.dateTime) >= now)
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
            .slice(0, 3);

        // 2. Today's Medications
        const todayMeds = meds.filter(m => {
            if (m.status !== 'Active') return false;
            const start = new Date(m.startDate).getTime();
            const end = m.endDate ? new Date(m.endDate).getTime() : Infinity;
            return startOfToday >= start && startOfToday <= end;
        });

        // 3. Overdue Reminders Count
        const overdueCount = rems.data.filter(r =>
            r.status === 0 && // Pending
            new Date(r.scheduledTime) < now
        ).length;

        // 4. Notification Stats
        const deliveredToday = notifs.data.filter(n => {
            const sent = new Date(n.sentAt).getTime();
            return sent >= startOfToday && n.status >= 1; // Delivered+
        }).length;

        const failedTotal = notifs.data.filter(n => n.status === 4).length;

        return {
            upcomingAppointments: upcomingAppts,
            todayMedications: todayMeds,
            overdueRemindersCount: overdueCount,
            notifications: {
                deliveredToday,
                failedTotal
            }
        };
    }
};
