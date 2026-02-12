import axios, { type AxiosResponse } from "axios";

// Create specific client for Notification Service
const notificationClient = axios.create({
    baseURL: import.meta.env.VITE_API_NOTIFICATION_URL || 'http://localhost:5006',
    headers: {
        "Content-Type": "application/json",
    },
});

// Notification delivery status enum (matches backend)
export enum NotificationStatus {
    Sent = 0,
    Delivered = 1,
    Read = 2,
    Acknowledged = 3,
    Failed = 4,
    Retrying = 5
}

// Notification delivery channel
export enum DeliveryChannel {
    MobilePush = 0,
    Email = 1,
    InApp = 2,
    SMS = 3
}

// Notification recipient type
export enum RecipientType {
    ElderlyUser = 0,
    Caregiver = 1
}

// Source event type
export enum SourceEventType {
    Medication = 0,
    Appointment = 1,
    Health = 2
}

// Backend notification structure (matches NotificationSummaryDto)
export interface Notification {
    id: string;
    userId: string;
    sourceReminderId: string;
    title: string;
    message: string;
    status: NotificationStatus;
    deliveryChannel: DeliveryChannel;
    recipientType: RecipientType;
    sentAt: string; // ISO timestamp
    deliveredAt?: string;
    readAt?: string;
    acknowledgedAt?: string;
    failureReason?: string;
    retryCount: number;
    createdAt: string;
    updatedAt: string;
}

// Delivery attempt history (matches DeliveryAttemptDto)
export interface DeliveryAttempt {
    attemptNumber: number;
    attemptedAt: string;
    status: string; // "Success" | "Failed" | "Pending"
    channel: DeliveryChannel;
    errorReason?: string;
}

// Notification detail (matches NotificationDetailDto)
export interface NotificationDetail {
    id: string;
    userId: string;
    sourceReminderId: string;
    sourceEventType: SourceEventType;
    sourceEventId: string;
    title: string;
    message: string;
    status: NotificationStatus;
    deliveryChannel: DeliveryChannel;
    recipientType: RecipientType;
    sentAt: string;
    deliveredAt?: string;
    readAt?: string;
    acknowledgedAt?: string;
    failureReason?: string;
    retryCount: number;
    createdAt: string;
    updatedAt: string;
    deliveryAttempts: DeliveryAttempt[];

    // Optional enriched data from frontend mapping (if needed later)
    sourceEvent?: {
        name: string;
        type: string;
    };
}

// Update notification status payload
export interface UpdateNotificationStatusPayload {
    status: NotificationStatus;
}

export const notificationApi = {
    // Get all notifications for current user
    getNotifications: (userId: string, page = 1, pageSize = 50): Promise<AxiosResponse<Notification[]>> =>
        notificationClient.get("/api/notifications", {
            params: { userId, page, pageSize }
        }),

    // Get notification detail by ID
    getNotificationDetail: (id: string): Promise<AxiosResponse<NotificationDetail>> =>
        notificationClient.get(`/api/notifications/${id}`),

    // Mark notification as read
    markAsRead: (id: string): Promise<AxiosResponse<Notification>> =>
        notificationClient.patch(`/api/notifications/${id}/read`, {}),

    // Acknowledge notification
    acknowledge: (id: string): Promise<AxiosResponse<Notification>> =>
        notificationClient.patch(`/api/notifications/${id}/acknowledge`, {}),

    // Retry failed notification delivery
    retryDelivery: (id: string): Promise<AxiosResponse<Notification>> =>
        notificationClient.post(`/api/notifications/${id}/retry`, {}),
};
