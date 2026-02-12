import type { Medication } from '../api/medication.api';
import { medicationMockService } from '../api/medication.mock';
import { medicationReminderGenerator } from './medicationReminderGenerator';

/**
 * MEDICATION DOMAIN SERVICE
 *
 * Responsibility:
 * 1. Orchestrate Data Persistence (Mock / API)
 * 2. Trigger Domain Side Effects (Reminder Generation)
 * 3. Enforce Domain Rules
 */
export const medicationService = {

    getMedications: async (): Promise<Medication[]> => {
        return await medicationMockService.getMedications();
    },

    addMedication: async (payload: Omit<Medication, 'id' | 'userId' | 'linkedRemindersCount' | 'createdAt' | 'updatedAt'>): Promise<Medication> => {
        console.log('[MedicationService] Adding new medication...');

        // 1. Persist Data
        const newMed = await medicationMockService.addMedication(payload);

        // 2. Trigger Side Effects (Generate Reminders)
        await medicationReminderGenerator.generateReminders(newMed);

        return newMed;
    },

    updateMedication: async (id: string, updates: Partial<Medication>): Promise<Medication> => {
        console.log(`[MedicationService] Updating medication ${id}...`);

        // 1. Persist Data
        const updatedMed = await medicationMockService.updateMedication(id, updates);

        // 2. Trigger Side Effects
        // If critical fields changed, regenerate reminders
        // For simplicity, we just check if schedule/status might be affected
        if (updates.frequency || updates.startDate || updates.endDate || updates.status || updates.dosage) {
            await medicationReminderGenerator.updateReminders(updatedMed);
        }

        return updatedMed;
    },

    toggleStatus: async (med: Medication): Promise<Medication> => {
        console.log(`[MedicationService] Toggling status for ${med.id}...`);

        // 1. Persist Data (Toggle logic is in Mock for now, but usually here)
        // Since Mock has specific toggle logic, we call it.
        const updatedMed = await medicationMockService.toggleStatus(med.id);

        // 2. Trigger Side Effects
        if (updatedMed.status === 'Paused') {
            await medicationReminderGenerator.pauseReminders(updatedMed.id);
        } else if (updatedMed.status === 'Active') {
            await medicationReminderGenerator.resumeReminders(updatedMed);
        }

        return updatedMed;
    },

    deleteMedication: async (id: string): Promise<void> => {
        console.log(`[MedicationService] Deleting medication ${id}...`);

        // 1. Persist Data
        await medicationMockService.deleteMedication(id);

        // 2. Trigger Side Effects (Cancel Reminders)
        await medicationReminderGenerator.cancelReminders(id);
    }
};
