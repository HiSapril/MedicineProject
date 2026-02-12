import type { Medication } from './medication.api';

// Helper for consistent mock GUIDs
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

// Initial Mock Data
let mockMedications: Medication[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        userId: MOCK_USER_ID,
        name: 'Lisinopril',
        form: 'Tablet',
        dosage: { amount: 10, unit: 'mg' },
        frequency: { type: 'Daily', timesPerDay: 1, specificTimes: ['08:00'] },
        startDate: new Date().toISOString(),
        status: 'Active',
        instructions: 'Take with food',
        linkedRemindersCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        userId: MOCK_USER_ID,
        name: 'Metformin',
        form: 'Tablet',
        dosage: { amount: 500, unit: 'mg' },
        frequency: { type: 'Daily', timesPerDay: 2, specificTimes: ['08:00', '20:00'] },
        startDate: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
        status: 'Active',
        instructions: 'Do not crush',
        linkedRemindersCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        userId: MOCK_USER_ID,
        name: 'Amoxicillin',
        form: 'Capsule',
        dosage: { amount: 250, unit: 'mg' },
        frequency: { type: 'Interval', intervalDays: 8, timesPerDay: 3 },
        startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
        endDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'Completed',
        linkedRemindersCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '44444444-4444-4444-4444-444444444444',
        userId: MOCK_USER_ID,
        name: 'Vitamin D',
        form: 'Capsule',
        dosage: { amount: 1000, unit: 'mg' },
        frequency: { type: 'Weekly', daysOfWeek: [1] }, // Monday
        startDate: new Date().toISOString(),
        status: 'Paused',
        instructions: 'Resume in winter',
        linkedRemindersCount: 0,
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
