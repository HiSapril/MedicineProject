import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

export interface Medication {
    id: string;
    userId: string;
    name: string;
    form: 'Tablet' | 'Capsule' | 'Liquid' | 'Injection' | 'Other';
    dosage: {
        amount: number;
        unit: 'mg' | 'ml' | 'tablet' | 'pills';
    };
    frequency: {
        type: 'Daily' | 'Weekly' | 'Interval' | 'AsNeeded';
        timesPerDay?: number;
        specificTimes?: string[]; // ["08:00", "20:00"]
        daysOfWeek?: number[]; // [1, 3, 5] for Mon, Wed, Fri
        intervalDays?: number; // Every 2 days
    };
    startDate: string; // ISO Date
    endDate?: string;
    instructions?: string;
    status: 'Active' | 'Paused' | 'Completed';
    linkedRemindersCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * BACKEND DTOs
 * Matches MedicationService.Models.DTOs
 */
export interface MedicationResponseDto {
    id: string;
    userId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    scheduledTimes: string;
    instructions: string | null;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMedicationDto {
    userId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    scheduledTimes: string;
    instructions?: string;
    startDate: string;
    endDate?: string;
}

export const medicationApi = {
    getMedications: (): Promise<AxiosResponse<MedicationResponseDto[]>> =>
        axiosClient.get("/api/medications"),

    createMedication: (payload: CreateMedicationDto): Promise<AxiosResponse<MedicationResponseDto>> =>
        axiosClient.post("/api/medications", payload),

    updateMedication: (id: string, payload: Partial<CreateMedicationDto>): Promise<AxiosResponse<MedicationResponseDto>> =>
        axiosClient.put(`/api/medications/${id}`, payload),

    deleteMedication: (id: string): Promise<AxiosResponse<void>> =>
        axiosClient.delete(`/api/medications/${id}`),
};
