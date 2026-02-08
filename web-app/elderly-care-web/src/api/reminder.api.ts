import axiosClient from "./axiosClient";

export interface CreateReminderPayload {
    message: string;
    scheduledTime: string;
    type?: string;
}

export const reminderApi = {
    getReminders: () =>
        axiosClient.get("/api/reminders"),

    createReminder: (payload: CreateReminderPayload) =>
        axiosClient.post("/api/reminders", payload),

    updateReminder: (id: string, payload: Partial<CreateReminderPayload>) =>
        axiosClient.put(`/api/reminders/${id}`, payload),

    deleteReminder: (id: string) =>
        axiosClient.delete(`/api/reminders/${id}`),
};
