import type { Medication } from './medication.api';

// Helper for consistent mock GUIDs
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

// Initial Mock Data (Refactored to meet strict dataset requirements)
let mockMedications: Medication[] = [
    {
        id: 'med-1',
        userId: MOCK_USER_ID,
        name: 'Lisinopril',
        form: 'Tablet',
        dosage: { amount: 10, unit: 'mg' },
        frequency: { type: 'Daily', timesPerDay: 1, specificTimes: ['08:00'] },
        startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'Active',
        instructions: 'Take in the morning with water',
        linkedRemindersCount: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'med-2',
        userId: MOCK_USER_ID,
        name: 'Amoxicillin',
        form: 'Capsule',
        dosage: { amount: 500, unit: 'mg' },
        frequency: { type: 'Interval', intervalDays: 1, timesPerDay: 3, specificTimes: ['07:00', '13:00', '19:00'] },
        startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'Active',
        instructions: 'Finish the entire course',
        linkedRemindersCount: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'med-3',
        userId: MOCK_USER_ID,
        name: 'Metformin',
        form: 'Tablet',
        dosage: { amount: 500, unit: 'mg' },
        frequency: { type: 'Daily', timesPerDay: 2, specificTimes: ['09:00', '21:00'] },
        startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
        status: 'Paused',
        instructions: 'Hold if having surgery',
        linkedRemindersCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'med-4',
        userId: MOCK_USER_ID,
        name: 'Vitamin D3',
        form: 'Capsule',
        dosage: { amount: 1000, unit: 'IU' as any },
        frequency: { type: 'Daily', timesPerDay: 1, specificTimes: ['10:00'] },
        startDate: new Date(Date.now() - 86400000 * 60).toISOString(), // 60 days ago
        endDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
        status: 'Completed',
        instructions: 'Supports bone health',
        linkedRemindersCount: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'med-5',
        userId: MOCK_USER_ID,
        name: 'Omega-3',
        form: 'Liquid',
        dosage: { amount: 5, unit: 'ml' as any },
        frequency: { type: 'Daily', timesPerDay: 1, specificTimes: ['12:00'] },
        startDate: new Date(Date.now() + 86400000 * 1).toISOString(), // Starts tomorrow
        status: 'Active',
        instructions: 'Shake well before use',
        linkedRemindersCount: 0, // Newly created, no active reminders yet
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

const SIMULATED_DELAY = 600;

export const medicationMockService = {
    getMedications: async (): Promise<Medication[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve([...mockMedications]), SIMULATED_DELAY);
        });
    },

    addMedication: async (med: Omit<Medication, 'id' | 'userId' | 'linkedRemindersCount' | 'createdAt' | 'updatedAt'>): Promise<Medication> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newMed: Medication = {
                    ...med,
                    id: crypto.randomUUID(),
                    userId: MOCK_USER_ID,
                    linkedRemindersCount: 0,
                    status: 'Active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                mockMedications.push(newMed);
                resolve(newMed);
            }, SIMULATED_DELAY);
        });
    },

    updateMedication: async (id: string, updates: Partial<Medication>): Promise<Medication> => {
        return new Promise<Medication>((resolve, reject) => {
            setTimeout(() => {
                const index = mockMedications.findIndex(m => m.id === id);
                if (index === -1) {
                    reject(new Error('Medication not found'));
                    return;
                }
                const updated = { ...mockMedications[index], ...updates, updatedAt: new Date().toISOString() };
                mockMedications[index] = updated;
                resolve(updated);
            }, SIMULATED_DELAY);
        });
    },

    toggleStatus: async (id: string): Promise<Medication> => {
        return new Promise<Medication>((resolve, reject) => {
            setTimeout(() => {
                const index = mockMedications.findIndex(m => m.id === id);
                if (index === -1) {
                    reject(new Error('Medication not found'));
                    return;
                }
                const current = mockMedications[index];
                let newStatus: Medication['status'] = current.status;

                if (current.status === 'Active') {
                    newStatus = 'Paused';
                } else if (current.status === 'Paused') {
                    newStatus = 'Active';
                }

                const updated = { ...current, status: newStatus, updatedAt: new Date().toISOString() };
                mockMedications[index] = updated;
                resolve(updated);
            }, SIMULATED_DELAY);
        });
    },

    deleteMedication: async (id: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const index = mockMedications.findIndex(m => m.id === id);
                if (index === -1) {
                    reject(new Error('Medication not found'));
                    return;
                }
                mockMedications = mockMedications.filter(m => m.id !== id);
                resolve();
            }, SIMULATED_DELAY);
        });
    }
};
