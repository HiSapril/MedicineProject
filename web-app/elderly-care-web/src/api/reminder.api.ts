import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

// Backend expects this simple structure
export interface CreateReminderPayload {
    userId: string;
    type: 0 | 1 | 2; // 0 = Medication, 1 = Appointment, 2 = Exercise/Health
    referenceId: string; // Source event ID
    scheduledTime: string; // ISO string
}

// Backend response structure
export interface Reminder {
    id: string;
    userId: string;
    type: 0 | 1 | 2;
    referenceId: string;
    scheduledTime: string;
    status: 0 | 1 | 2; // 0 = Pending, 1 = Done, 2 = Missed
    createdAt: string;
    updatedAt: string;
}

// Extended interface for frontend use (with computed fields)
export interface ReminderExtended extends Reminder {
    message?: string;
    sourceEventName?: string;
    sourceEventType?: string;
    isCompleted?: boolean;
    isSnoozed?: boolean;
}

export const reminderApi = {
    getReminders: (): Promise<AxiosResponse<Reminder[]>> =>
        axiosClient.get("/api/reminders"),

    createReminder: (payload: CreateReminderPayload): Promise<AxiosResponse<Reminder>> =>
        axiosClient.post("/api/reminders", payload),

    updateReminder: (id: string, payload: Partial<CreateReminderPayload>): Promise<AxiosResponse<Reminder>> =>
        axiosClient.put(`/api/reminders/${id}`, payload),

    deleteReminder: (id: string): Promise<AxiosResponse<void>> =>
        axiosClient.delete(`/api/reminders/${id}`),

    markAsCompleted: (id: string): Promise<AxiosResponse<Reminder>> =>
        axiosClient.patch(`/api/reminders/${id}/status`, { status: 1 }), // 1 = Done

    snooze: (id: string, minutes: number): Promise<AxiosResponse<Reminder>> =>
        axiosClient.patch(`/api/reminders/${id}/snooze`, { minutes }),
};
