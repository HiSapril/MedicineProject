import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

export interface Medication {
    id: string;
    userId: string;
    name: string;
    dosage: string;
    frequency: string;
    time: string;
    notes?: string;
    startDate: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMedicationPayload {
    name: string;
    dosage: string;
    time: string;
    notes?: string;
}

export const medicationApi = {
    getMedications: (): Promise<AxiosResponse<Medication[]>> =>
        axiosClient.get("/api/medications"),

    createMedication: (payload: CreateMedicationPayload): Promise<AxiosResponse<Medication>> =>
        axiosClient.post("/api/medications", payload),

    updateMedication: (id: string, payload: Partial<CreateMedicationPayload>): Promise<AxiosResponse<Medication>> =>
        axiosClient.put(`/api/medications/${id}`, payload),

    deleteMedication: (id: string): Promise<AxiosResponse<void>> =>
        axiosClient.delete(`/api/medications/${id}`),
};
