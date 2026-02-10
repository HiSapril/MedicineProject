import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";

export interface HealthLog {
    id: string;
    userId: string;
    date: string;
    bloodPressure: string;
    heartRate?: number;
    weight?: number;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHealthLogPayload {
    userId: string;
    date: string;
    bloodPressure: string;
    heartRate?: number;
    weight?: number;
    note?: string;
}

export const healthApi = {
    getHealthLogs: (): Promise<AxiosResponse<HealthLog[]>> =>
        axiosClient.get("/api/health-logs"),

    createHealthLog: (payload: CreateHealthLogPayload): Promise<AxiosResponse<HealthLog>> =>
        axiosClient.post("/api/health-logs", payload),
};
