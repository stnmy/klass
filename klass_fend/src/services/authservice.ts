import api from "../api/axios";

export interface LoginRequest {
    userName: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
};
