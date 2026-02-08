import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

export interface HealthLog {
    id: string;
    userId: string;
    timestamp: string;
    weight?: number;
    bloodPressure?: string;
    heartRate?: number;
    notes?: string;
}

export interface CreateHealthLogPayload {
    weight?: number;
    bloodPressure?: string;
    heartRate?: number;
    notes?: string;
}

export const healthApi = {
    getHealthLogs: (): Promise<AxiosResponse<HealthLog[]>> =>
        axiosClient.get("/api/health-logs"),

    createHealthLog: (payload: CreateHealthLogPayload): Promise<AxiosResponse<HealthLog>> =>
        axiosClient.post("/api/health-logs", payload),
};
