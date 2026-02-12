import {
    medicationApi,
    type Medication,
    type MedicationResponseDto,
    type CreateMedicationDto
} from '../api/medication.api';
import { medicationReminderGenerator } from './medicationReminderGenerator';
import { medicationMockService } from '../api/medication.mock';

export const medicationService = {

    getMedications: async (): Promise<Medication[]> => {
        if (import.meta.env.DEV) {
            return await medicationMockService.getMedications();
        }
        const response = await medicationApi.getMedications();
        return response.data.map(mapDtoToFrontend);
    },

    addMedication: async (payload: Omit<Medication, 'id' | 'userId' | 'linkedRemindersCount' | 'createdAt' | 'updatedAt'>): Promise<Medication> => {
        console.log('[MedicationService] Adding new medication...');

        let newMed: Medication;
        if (import.meta.env.DEV) {
            newMed = await medicationMockService.addMedication(payload);
        } else {
            const dto = mapFrontendToCreateDto(payload);
            dto.userId = "00000000-0000-0000-0000-000000000001";
            const response = await medicationApi.createMedication(dto);
            newMed = mapDtoToFrontend(response.data);
        }

        // 2. Trigger Side Effects (Generate Reminders)
        await medicationReminderGenerator.generateReminders(newMed);

        return newMed;
    },

    updateMedication: async (id: string, updates: Partial<Medication>): Promise<Medication> => {
        console.log(`[MedicationService] Updating medication ${id}...`);

        let updatedMed: Medication;
        if (import.meta.env.DEV) {
            updatedMed = await medicationMockService.updateMedication(id, updates);
        } else {
            const dto = mapFrontendToUpdateDto(updates);
            const response = await medicationApi.updateMedication(id, dto);
            updatedMed = mapDtoToFrontend(response.data);
        }

        // 2. Trigger Side Effects
        if (updates.frequency || updates.startDate || updates.endDate || updates.status || updates.dosage) {
            await medicationReminderGenerator.updateReminders(updatedMed);
        }

        return updatedMed;
    },

    toggleStatus: async (med: Medication): Promise<Medication> => {
        console.log(`[MedicationService] Toggling status for ${med.id}...`);

        let updatedMed: Medication;
        if (import.meta.env.DEV) {
            updatedMed = await medicationMockService.toggleStatus(med.id);
        } else {
            // Since backend doesn't support status, we just simulate the toggle and side effects for now
            const newStatus: Medication['status'] = med.status === 'Active' ? 'Paused' : 'Active';
            updatedMed = { ...med, status: newStatus };
        }

        // Trigger Side Effects
        if (updatedMed.status === 'Paused') {
            await medicationReminderGenerator.pauseReminders(updatedMed.id);
        } else if (updatedMed.status === 'Active') {
            await medicationReminderGenerator.resumeReminders(updatedMed);
        }

        return updatedMed;
    },

    deleteMedication: async (id: string): Promise<void> => {
        console.log(`[MedicationService] Deleting medication ${id}...`);
        if (import.meta.env.DEV) {
            await medicationMockService.deleteMedication(id);
        } else {
            await medicationApi.deleteMedication(id);
        }
        await medicationReminderGenerator.cancelReminders(id);
    }
};

/**
 * MAPPING UTILITIES
 */

function mapDtoToFrontend(dto: MedicationResponseDto): Medication {
    // Parse dosage: "10 mg" -> { amount: 10, unit: "mg" }
    const dosageParts = dto.dosage.split(' ');
    const amount = parseFloat(dosageParts[0]) || 0;
    const unit = (dosageParts[1] || 'mg') as Medication['dosage']['unit'];

    // Parse scheduled times: "08:00, 20:00" -> ["08:00", "20:00"]
    const specificTimes = dto.scheduledTimes ? dto.scheduledTimes.split(',').map(t => t.trim()) : [];

    // Determine status (crude fallback since backend lacks it)
    let status: Medication['status'] = 'Active';
    if (dto.endDate && new Date(dto.endDate) < new Date()) {
        status = 'Completed';
    }

    return {
        id: dto.id,
        userId: dto.userId,
        name: dto.medicationName,
        form: 'Tablet', // Backend lacks form, defaulting to Tablet
        dosage: { amount, unit },
        frequency: {
            type: (dto.frequency as any) || 'Daily',
            timesPerDay: specificTimes.length,
            specificTimes
        },
        startDate: dto.startDate,
        endDate: dto.endDate || undefined,
        instructions: dto.instructions || '',
        status,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    };
}

function mapFrontendToCreateDto(med: Partial<Medication>): CreateMedicationDto {
    return {
        userId: med.userId || '',
        medicationName: med.name || '',
        dosage: `${med.dosage?.amount || 0} ${med.dosage?.unit || 'mg'}`,
        frequency: med.frequency?.type || 'Daily',
        scheduledTimes: (med.frequency?.specificTimes || []).join(', '),
        instructions: med.instructions,
        startDate: med.startDate || new Date().toISOString(),
        endDate: med.endDate
    };
}

function mapFrontendToUpdateDto(med: Partial<Medication>): Partial<CreateMedicationDto> {
    const dto: Partial<CreateMedicationDto> = {};
    if (med.name) dto.medicationName = med.name;
    if (med.dosage) dto.dosage = `${med.dosage.amount} ${med.dosage.unit}`;
    if (med.frequency) {
        if (med.frequency.type) dto.frequency = med.frequency.type;
        if (med.frequency.specificTimes) dto.scheduledTimes = med.frequency.specificTimes.join(', ');
    }
    if (med.instructions !== undefined) dto.instructions = med.instructions;
    if (med.startDate) dto.startDate = med.startDate;
    if (med.endDate !== undefined) dto.endDate = med.endDate;
    return dto;
}
