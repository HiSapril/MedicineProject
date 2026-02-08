import axiosClient from "./axiosClient";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: number; // 0 = Elderly, 1 = Caregiver
}

export interface AuthResponse {
    userId: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

const authApi = {
    login: (data: LoginRequest) => {
        return axiosClient.post<AuthResponse>("/api/auth/login", data);
    },
    register: (data: RegisterRequest) => {
        return axiosClient.post<AuthResponse>("/api/auth/register", data);
    },
};

export default authApi;
