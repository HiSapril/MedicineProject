import type { Medication } from '../api/medication.api';
import { reminderApi, type CreateReminderPayload } from '../api/reminder.api';

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Helper to check if a date matches the "Weekly" schedule (daysOfWeek: 0-6)
const isDayOfWeek = (date: Date, days: number[]): boolean => {
    return days.includes(date.getDay());
};

// Helper: Format Time HH:mm to Date object on a specific day
const setTime = (date: Date, timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
};

export const medicationReminderGenerator = {
    /**
     * Generate future reminders for the next 30 days (or until EndDate)
     * This mimics the backend Background Service logic.
     */
    generateReminders: async (medication: Medication): Promise<void> => {
        if (medication.status !== 'Active') return;

        const remindersToCreate: CreateReminderPayload[] = [];
        const today = new Date();
        const startDate = new Date(medication.startDate);

        // Start from "Now" or "StartDate", whichever is later
        let currentDate = startDate > today ? startDate : today;
        currentDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Limit generation to 30 days window or EndDate
        const LAY_AHEAD_DAYS = 30;
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + LAY_AHEAD_DAYS);

        const endDate = medication.endDate ? new Date(medication.endDate) : maxDate;
        const cutoffDate = endDate < maxDate ? endDate : maxDate;

        // Loop day by day
        while (currentDate <= cutoffDate) {
            let shouldGenerate = false;

            // 1. Check Schedule Type
            if (medication.frequency.type === 'Daily') {
                shouldGenerate = true;
            } else if (medication.frequency.type === 'Weekly') {
                if (medication.frequency.daysOfWeek && isDayOfWeek(currentDate, medication.frequency.daysOfWeek)) {
                    shouldGenerate = true;
                }
            } else if (medication.frequency.type === 'Interval') {
                const interval = medication.frequency.intervalDays || 1;
                // Calculate days since start
                const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays % interval === 0) {
                    shouldGenerate = true;
                }
            }

            // 2. If valid day, generate for all specific times
            if (shouldGenerate) {
                const times = medication.frequency.specificTimes || ['08:00'];
                for (const time of times) {
                    const scheduledDateTime = setTime(currentDate, time);

                    // Only generate future times (or slightly past today if just created)
                    // But typically we don't want to spam "Missed" reminders for today if created at 5PM and schedule was 8AM.
                    // Let's assume we only generate if time > now (roughly).
                    // Or for simplicity in mock, just generate all for "Today" onwards.

                    remindersToCreate.push({
                        userId: medication.userId,
                        type: 0, // Medication
                        referenceId: medication.id,
                        scheduledTime: scheduledDateTime.toISOString() // This will be Local or UTC depending on how setTime works. setTime uses local. toISOString converts to UTC. Ideally we want strict UTC handling but this is a mock.
                    });
                }
            }

            // Next day
            currentDate = addDays(currentDate, 1);
        }

        // Bulk Create (Mocking loop since API is single create)
        // In a real app, use a bulk endpoint.
        console.log(`[MockGenerator] Generating ${remindersToCreate.length} reminders for ${medication.name}...`);
        for (const payload of remindersToCreate) {
            // In a real scenario, this would be slow. In mock, it's fine.
            await reminderApi.createReminder(payload);
        }
    },

    /**
     * Cancel future reminders and re-generate.
     */
    updateReminders: async (medication: Medication): Promise<void> => {
        await medicationReminderGenerator.cancelReminders(medication.id);
        await medicationReminderGenerator.generateReminders(medication);
    },

    /**
     * Cancel all FUTURE reminders for this medication.
     * Keep past ones for history.
     */
    cancelReminders: async (medicationId: string): Promise<void> => {
        console.log(`[MockGenerator] Cancelling future reminders for ${medicationId}...`);

        // 1. Get all reminders (inefficient but this is a mock)
        const allReminders = await reminderApi.getReminders();

        // 2. Filter: Matches MedID AND is in Future AND is Pending
        const now = new Date();
        const toDelete = allReminders.data.filter(r =>
            r.referenceId === medicationId &&
            r.status === 0 && // Pending
            new Date(r.scheduledTime) > now
        );

        // 3. Delete them
        for (const r of toDelete) {
            await reminderApi.deleteReminder(r.id);
        }
        console.log(`[MockGenerator] Cancelled ${toDelete.length} reminders.`);
    },

    pauseReminders: async (medicationId: string): Promise<void> => {
        // Same as cancel for now (stop future generation)
        // If we supported "Pause" status in Reminder (e.g. status=3), we would update instead of delete.
        // But for this requirement, "Disables all future reminders" -> Delete is safest for mock.
        await medicationReminderGenerator.cancelReminders(medicationId);
    },

    resumeReminders: async (medication: Medication): Promise<void> => {
        // Just generate from now
        await medicationReminderGenerator.generateReminders(medication);
    }
};
