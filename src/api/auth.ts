import {apiClient, setAuthToken} from "./client";
import axios from "axios";

export async function login(login: string, password: string): Promise<void> {
    try{
        const { data } = await apiClient.post("/auth/login", {
            login: login,
            password: password
        });

        setAuthToken(data.token);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // TODO: Посмотреть и обработать ошибки выдающиеся при аутентификации в апи
            throw error;
        }
    }
}

export async function register(login: string, password: string): Promise<void> {
    try {
        await apiClient.post("/auth/register", {
            login: login,
            password: password
        });
    } catch (error) {
        throw error;
    }
}