// Mock Notification Data Generator
// This file provides mock data for testing NotificationsPage
// Remove this when backend NotificationService is ready

import {
    type Notification,
    type NotificationDetail,
    NotificationStatus,
    DeliveryChannel,
    RecipientType
} from './notification.api';

const now = new Date();

// Helper to create dates relative to now
const daysAgo = (days: number, hours: number = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    date.setHours(date.getHours() - hours);
    return date.toISOString();
};

export const mockNotifications: Notification[] = [
    // Today - Delivered
    {
        id: 'notif-001',
        userId: 'user-123',
        reminderId: 'rem-001',
        title: 'Reminder: Doctor Appointment',
        message: 'You have an appointment with Dr. Johnson at 9:00 AM tomorrow. Please arrive 15 minutes early for check-in.',
        status: NotificationStatus.Delivered,
        deliveryChannel: DeliveryChannel.MobilePush,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(0, 2),
        deliveredAt: daysAgo(0, 2),
        retryCount: 0,
        createdAt: daysAgo(0, 2),
        updatedAt: daysAgo(0, 2)
    },

    // Today - Read
    {
        id: 'notif-002',
        userId: 'user-123',
        reminderId: 'rem-002',
        title: 'Reminder: Blood Pressure Medication',
        message: 'Take your blood pressure medication (Lisinopril 10mg) at 8:00 AM.',
        status: NotificationStatus.Read,
        deliveryChannel: DeliveryChannel.MobilePush,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(0, 4),
        deliveredAt: daysAgo(0, 4),
        readAt: daysAgo(0, 3),
        retryCount: 0,
        createdAt: daysAgo(0, 4),
        updatedAt: daysAgo(0, 3)
    },

    // Today - Acknowledged
    {
        id: 'notif-003',
        userId: 'user-123',
        reminderId: 'rem-003',
        title: 'Reminder: Daily Exercise',
        message: 'Time for your daily 15-minute walk. Remember to stay hydrated!',
        status: NotificationStatus.Acknowledged,
        deliveryChannel: DeliveryChannel.InApp,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(0, 6),
        deliveredAt: daysAgo(0, 6),
        readAt: daysAgo(0, 5),
        acknowledgedAt: daysAgo(0, 5),
        retryCount: 0,
        createdAt: daysAgo(0, 6),
        updatedAt: daysAgo(0, 5)
    },

    // Yesterday - Failed
    {
        id: 'notif-004',
        userId: 'user-123',
        reminderId: 'rem-004',
        title: 'Reminder: Diabetes Medication',
        message: 'Take your diabetes medication (Metformin 500mg) with breakfast.',
        status: NotificationStatus.Failed,
        deliveryChannel: DeliveryChannel.MobilePush,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(1, 2),
        errorReason: 'Device offline',
        retryCount: 2,
        createdAt: daysAgo(1, 2),
        updatedAt: daysAgo(1, 2)
    },

    // Yesterday - Acknowledged
    {
        id: 'notif-005',
        userId: 'user-123',
        reminderId: 'rem-005',
        title: 'Reminder: Physical Therapy Session',
        message: 'Physical therapy session with Dr. Smith at 2:00 PM today.',
        status: NotificationStatus.Acknowledged,
        deliveryChannel: DeliveryChannel.Email,
        recipientType: RecipientType.Caregiver,
        sentAt: daysAgo(1, 10),
        deliveredAt: daysAgo(1, 10),
        readAt: daysAgo(1, 9),
        acknowledgedAt: daysAgo(1, 8),
        retryCount: 0,
        createdAt: daysAgo(1, 10),
        updatedAt: daysAgo(1, 8)
    },

    // Past 7 Days - Delivered
    {
        id: 'notif-006',
        userId: 'user-123',
        reminderId: 'rem-006',
        title: 'Reminder: Lab Test Appointment',
        message: 'Fasting blood test scheduled for tomorrow at 7:00 AM. No food or drink after midnight.',
        status: NotificationStatus.Delivered,
        deliveryChannel: DeliveryChannel.SMS,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(3, 0),
        deliveredAt: daysAgo(3, 0),
        retryCount: 0,
        createdAt: daysAgo(3, 0),
        updatedAt: daysAgo(3, 0)
    },

    // Past 7 Days - Acknowledged
    {
        id: 'notif-007',
        userId: 'user-123',
        reminderId: 'rem-007',
        title: 'Reminder: Heart Rate Check',
        message: 'Time to check your heart rate and blood pressure. Record the results in your health log.',
        status: NotificationStatus.Acknowledged,
        deliveryChannel: DeliveryChannel.MobilePush,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(5, 0),
        deliveredAt: daysAgo(5, 0),
        readAt: daysAgo(5, 0),
        acknowledgedAt: daysAgo(4, 23),
        retryCount: 0,
        createdAt: daysAgo(5, 0),
        updatedAt: daysAgo(4, 23)
    },

    // Older - Acknowledged
    {
        id: 'notif-008',
        userId: 'user-123',
        reminderId: 'rem-008',
        title: 'Reminder: Cardiology Follow-up',
        message: 'Follow-up appointment with cardiologist Dr. Williams at 10:30 AM.',
        status: NotificationStatus.Acknowledged,
        deliveryChannel: DeliveryChannel.MobilePush,
        recipientType: RecipientType.ElderlyUser,
        sentAt: daysAgo(10, 0),
        deliveredAt: daysAgo(10, 0),
        readAt: daysAgo(10, 0),
        acknowledgedAt: daysAgo(9, 23),
        retryCount: 0,
        createdAt: daysAgo(10, 0),
        updatedAt: daysAgo(9, 23)
    },

    // Older - Failed (multiple retries)
    {
        id: 'notif-009',
        userId: 'user-123',
        reminderId: 'rem-009',
        title: 'Reminder: Prescription Refill',
        message: 'Your prescription for Lisinopril is running low. Schedule a refill with your pharmacy.',
        status: NotificationStatus.Failed,
        deliveryChannel: DeliveryChannel.Email,
        recipientType: RecipientType.Caregiver,
        sentAt: daysAgo(15, 0),
        errorReason: 'Invalid email address',
        retryCount: 4,
        createdAt: daysAgo(15, 0),
        updatedAt: daysAgo(15, 0)
    }
];

export const mockNotificationDetail: NotificationDetail = {
    ...mockNotifications[0],
    sourceReminder: {
        id: 'rem-001',
        type: 1, // Appointment
        referenceId: 'apt-001',
        scheduledTime: daysAgo(0, 2)
    },
    sourceEvent: {
        id: 'apt-001',
        type: 'Appointment',
        name: 'Dr. Johnson - Cardiology',
        date: daysAgo(-1, 0) // Tomorrow
    },
    deliveryAttempts: [
        {
            attemptNumber: 1,
            attemptedAt: daysAgo(0, 2),
            status: 'Success',
            channel: DeliveryChannel.MobilePush
        }
    ]
};

// Mock API responses for development
export const mockNotificationApi = {
    getNotifications: () => Promise.resolve({ data: mockNotifications }),

    getNotificationDetail: (id: string) => {
        const notification = mockNotifications.find(n => n.id === id);
        if (!notification) {
            return Promise.reject(new Error('Notification not found'));
        }

        const detail: NotificationDetail = {
            ...notification,
            sourceReminder: {
                id: notification.reminderId,
                type: notification.title.includes('Appointment') ? 1 : notification.title.includes('Medication') ? 0 : 2,
                referenceId: 'ref-' + notification.id,
                scheduledTime: notification.sentAt
            },
            sourceEvent: {
                id: 'evt-' + notification.id,
                type: notification.title.includes('Appointment') ? 'Appointment' : notification.title.includes('Medication') ? 'Medication' : 'Health',
                name: notification.title.replace('Reminder: ', ''),
                date: notification.sentAt
            },
            deliveryAttempts: [
                {
                    attemptNumber: 1,
                    attemptedAt: notification.sentAt,
                    status: notification.status === NotificationStatus.Failed ? 'Failed' : 'Success',
                    channel: notification.deliveryChannel,
                    errorReason: notification.errorReason
                }
            ]
        };

        return Promise.resolve({ data: detail });
    },

    markAsRead: (id: string) => {
        const notification = mockNotifications.find(n => n.id === id);
        if (!notification) {
            return Promise.reject(new Error('Notification not found'));
        }

        return Promise.resolve({
            data: {
                ...notification,
                status: NotificationStatus.Read,
                readAt: new Date().toISOString()
            }
        });
    },

    acknowledge: (id: string) => {
        const notification = mockNotifications.find(n => n.id === id);
        if (!notification) {
            return Promise.reject(new Error('Notification not found'));
        }

        return Promise.resolve({
            data: {
                ...notification,
                status: NotificationStatus.Acknowledged,
                acknowledgedAt: new Date().toISOString()
            }
        });
    },

    retryDelivery: (id: string) => {
        const notification = mockNotifications.find(n => n.id === id);
        if (!notification) {
            return Promise.reject(new Error('Notification not found'));
        }

        // Simulate retry
        const success = Math.random() > 0.3; // 70% success rate

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (success) {
                    resolve({
                        data: {
                            ...notification,
                            status: NotificationStatus.Delivered,
                            deliveredAt: new Date().toISOString(),
                            retryCount: notification.retryCount + 1,
                            errorReason: undefined
                        }
                    });
                } else {
                    reject({
                        response: {
                            data: {
                                message: 'Device still offline'
                            }
                        }
                    });
                }
            }, 1500);
        });
    }
};
