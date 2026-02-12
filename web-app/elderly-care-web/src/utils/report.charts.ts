import type { ReminderPerformance, NotificationDelivery } from '../types/report.types';

/**
 * CHART TRANSFORMATION HELPERS
 * 
 * Transforms domain report data into formats consumable by Recharts.
 */
export const chartHelpers = {
    /**
     * Transforms Reminder Performance outcome breakdown for Pie Charts
     */
    getReminderOutcomeData: (perf: ReminderPerformance) => perf.outcomeBreakdown,

    /**
     * Transforms Notification Channel breakdown
     */
    getNotificationChannelData: (delivery: NotificationDelivery) => delivery.channelBreakdown,

    /**
     * Transforms Notification Recipient breakdown
     */
    getNotificationRecipientData: (delivery: NotificationDelivery) => delivery.recipientBreakdown,

    /**
     * Color Palettes for calm, neutral design
     */
    colors: {
        primary: '#3498db',
        secondary: '#9b59b6',
        success: '#2ecc71',
        warning: '#f1c40f',
        danger: '#e74c3c',
        muted: '#95a5a6',
        chart: [
            '#3498db', // Blue
            '#2ecc71', // Green
            '#f1c40f', // Yellow
            '#e67e22', // Orange
            '#e74c3c', // Red
            '#9b59b6', // Purple
            '#95a5a6'  // Gray
        ]
    }
};
