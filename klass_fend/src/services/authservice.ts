import api from "../api/axios";

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    error?: string;
    userId: number;
    userName: string;
    role: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
};
