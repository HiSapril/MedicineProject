import type { CreateAppointmentPayload } from './appointment.api';

// MOCK DATA – DEV ONLY – DO NOT SHIP

export interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    dateTime: string;
    location: string;
    notes: string;
    status: 'upcoming' | 'completed' | 'cancelled';
}

const now = new Date();
const getOffsetDate = (days: number, hours = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
};

let mockAppointments: Appointment[] = [
    {
        id: 'appt-1',
        doctorName: 'Dr. Sarah Wilson',
        specialty: 'Cardiology',
        dateTime: getOffsetDate(-5), // 5 days ago
        location: 'Heart Center, 3rd Floor',
        notes: 'Regular checkup for BP monitoring',
        status: 'completed'
    },
    {
        id: 'appt-2',
        doctorName: 'Dr. James Chen',
        specialty: 'General Practice',
        dateTime: getOffsetDate(0, 2), // Today, in 2 hours
        location: 'City Medical Plaza',
        notes: 'Follow up on flu symptoms',
        status: 'upcoming'
    },
    {
        id: 'appt-3',
        doctorName: 'Dr. Emily Brown',
        specialty: 'Dentist',
        dateTime: getOffsetDate(3), // In 3 days
        location: 'Dental Wellness Suite',
        notes: 'Deep cleaning',
        status: 'upcoming'
    },
    {
        id: 'appt-4',
        doctorName: 'Dr. Robert Miller',
        specialty: 'Optometrist',
        dateTime: getOffsetDate(7), // In 7 days
        location: 'Vision Care Center',
        notes: 'Prescription renewal',
        status: 'upcoming'
    },
    {
        id: 'appt-5',
        doctorName: 'Dr. Sarah Wilson',
        specialty: 'Cardiology',
        dateTime: getOffsetDate(-14), // 14 days ago
        location: 'Heart Center, 3rd Floor',
        notes: 'ECG scan',
        status: 'completed'
    },
    {
        id: 'appt-6',
        doctorName: 'Dr. Maria Garcia',
        specialty: 'Physiotherapy',
        dateTime: getOffsetDate(10), // In 10 days
        location: 'Rehab Wing, Room 402',
        notes: 'Knee strengthening session',
        status: 'upcoming'
    },
    {
        id: 'appt-7',
        doctorName: 'Dr. James Chen',
        specialty: 'General Practice',
        dateTime: getOffsetDate(-2), // 2 days ago
        location: 'City Medical Plaza',
        notes: 'Vaccination',
        status: 'cancelled'
    },
    {
        id: 'appt-8',
        doctorName: 'Specialist Clinic',
        specialty: 'Dermatology',
        dateTime: getOffsetDate(14), // In 14 days
        location: 'Medical Arts Building',
        notes: 'Skin mole check (No reminder needed for demo)',
        status: 'upcoming'
    }
];

export const appointmentMockService = {
    getAll: async () => {
        return { data: [...mockAppointments] };
    },

    create: async (payload: CreateAppointmentPayload) => {
        const newAppt: Appointment = {
            id: `appt-${Date.now()}`,
            doctorName: payload.doctorName,
            specialty: payload.specialty || 'General',
            dateTime: payload.appointmentDate,
            location: payload.location,
            notes: payload.notes || '',
            status: 'upcoming'
        };
        mockAppointments.push(newAppt);
        return { data: newAppt };
    },

    update: async (id: string, payload: Partial<CreateAppointmentPayload>) => {
        const index = mockAppointments.findIndex(a => a.id === id);
        if (index !== -1) {
            mockAppointments[index] = {
                ...mockAppointments[index],
                doctorName: payload.doctorName || mockAppointments[index].doctorName,
                location: payload.location || mockAppointments[index].location,
                dateTime: payload.appointmentDate || mockAppointments[index].dateTime,
                notes: payload.notes || mockAppointments[index].notes,
                specialty: payload.specialty || mockAppointments[index].specialty
            };
            return { data: mockAppointments[index] };
        }
        throw new Error('Appointment not found');
    },

    delete: async (id: string) => {
        mockAppointments = mockAppointments.filter(a => a.id !== id);
        return { data: null };
    }
};
