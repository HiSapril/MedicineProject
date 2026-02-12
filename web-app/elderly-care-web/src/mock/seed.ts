import { medicationService } from '../services/medication.service';
import { medicationReminderGenerator } from '../services/medicationReminderGenerator';
import { reminderApi } from '../api/reminder.api';
import { appointmentMockService } from '../api/appointment.mock';

/**
 * MOCK DATA SEEDER
 * 
 * Responsibility: Ensure the system has a consistent "warm" state in DEV mode.
 * Crucially, it maps mock events to real Reminder objects via the API.
 */
export const seedMocks = async () => {
    if (!import.meta.env.DEV) return;

    try {
        console.log('🌱 [Seed] Checking reminder system state...');

        // 1. Check if reminders already exist
        const currentReminders = await reminderApi.getReminders();

        if (currentReminders.data.length > 0) {
            console.log('🌱 [Seed] Reminders already exist. Skipping seed.');
            return;
        }

        console.log('🌱 [Seed] Starting cross-domain seeding...');

        // 2. Seed Medication Reminders
        // Pull medications (from our mock service)
        const meds = await medicationService.getMedications();
        const activeMeds = meds.filter(m => m.status === 'Active');

        console.log(`🌱 [Seed] Generating reminders for ${activeMeds.length} active medications...`);
        for (const med of activeMeds) {
            await medicationReminderGenerator.generateReminders(med);
        }

        // 3. Seed Appointment Reminders
        const appts = await appointmentMockService.getAll();
        const upcomingAppts = appts.data.filter(a => a.status === 'upcoming');

        console.log(`🌱 [Seed] Seeding reminders for ${upcomingAppts.length} upcoming appointments...`);
        for (const appt of upcomingAppts) {
            // We only seed for some appointments to test edge cases (per requirement)
            if (appt.id === 'appt-8') continue; // Specialist Clinic has no reminder

            await reminderApi.createReminder({
                userId: '00000000-0000-0000-0000-000000000001',
                type: 1, // Appointment
                referenceId: appt.id,
                scheduledTime: appt.dateTime // Simplified: at event time
            });
        }

        console.log('✅ [Seed] Mock data initialized successfully.');
    } catch (error) {
        console.error('❌ [Seed] Mock initialization failed:', error);
    }
};
