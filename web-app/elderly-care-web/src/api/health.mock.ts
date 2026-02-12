import type { HealthLog, CreateHealthLogPayload } from './health.api';

// MOCK DATA – DEV ONLY – DO NOT SHIP

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

const now = new Date();
const getOffsetDate = (days: number, hours = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
};

let mockHealthLogs: HealthLog[] = [
    {
        id: 'log-1',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-1),
        bloodPressure: '120/80',
        heartRate: 72,
        weight: 68.5,
        note: 'Feeling good after morning walk',
        createdAt: getOffsetDate(-1),
        updatedAt: getOffsetDate(-1)
    },
    {
        id: 'log-2',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-2),
        bloodPressure: '122/82',
        heartRate: 75,
        weight: 68.7,
        createdAt: getOffsetDate(-2),
        updatedAt: getOffsetDate(-2)
    },
    {
        id: 'log-3',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-3),
        bloodPressure: '118/78',
        heartRate: 70,
        weight: 68.4,
        note: 'Blood sugar was 95 mg/dL (recorded in notes)',
        createdAt: getOffsetDate(-3),
        updatedAt: getOffsetDate(-3)
    },
    {
        id: 'log-4',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-4),
        bloodPressure: '130/85',
        heartRate: 80,
        note: 'Slightly high BP, will monitor',
        createdAt: getOffsetDate(-4),
        updatedAt: getOffsetDate(-4)
    },
    {
        id: 'log-5',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-5),
        bloodPressure: '121/79',
        heartRate: 73,
        weight: 68.6,
        createdAt: getOffsetDate(-5),
        updatedAt: getOffsetDate(-5)
    },
    {
        id: 'log-6',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-7),
        bloodPressure: '119/81',
        heartRate: 71,
        weight: 69.0,
        note: 'Activity check-in: 30 mins yoga',
        createdAt: getOffsetDate(-7),
        updatedAt: getOffsetDate(-7)
    },
    {
        id: 'log-7',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-8),
        bloodPressure: '125/83',
        heartRate: 76,
        createdAt: getOffsetDate(-8),
        updatedAt: getOffsetDate(-8)
    },
    {
        id: 'log-8',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-10),
        bloodPressure: '117/77',
        heartRate: 68,
        weight: 68.8,
        createdAt: getOffsetDate(-10),
        updatedAt: getOffsetDate(-10)
    },
    {
        id: 'log-9',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-12),
        bloodPressure: '122/80',
        heartRate: 74,
        createdAt: getOffsetDate(-12),
        updatedAt: getOffsetDate(-12)
    },
    {
        id: 'log-10',
        userId: MOCK_USER_ID,
        date: getOffsetDate(-14),
        bloodPressure: '120/80',
        heartRate: 72,
        weight: 68.5,
        note: 'Bi-weekly baseline',
        createdAt: getOffsetDate(-14),
        updatedAt: getOffsetDate(-14)
    }
];

export const healthMockService = {
    getHealthLogs: async () => {
        return { data: [...mockHealthLogs] };
    },

    createHealthLog: async (payload: CreateHealthLogPayload) => {
        const newLog: HealthLog = {
            id: `log-${Date.now()}`,
            userId: MOCK_USER_ID,
            date: payload.date || new Date().toISOString(),
            bloodPressure: payload.bloodPressure,
            heartRate: payload.heartRate,
            weight: payload.weight,
            note: payload.note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockHealthLogs.push(newLog);
        return { data: newLog };
    }
};
