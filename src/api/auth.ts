import {apiClient, setAuthToken} from "./client";
import axios, {HttpStatusCode} from "axios";

export async function login(login: string, password: string): Promise<void> {
    try{
        const { data } = await apiClient.post("/auth/login", {
            login: login,
            password: password
        });

        setAuthToken(data.token);
    } catch (error) {
        if (axios.isAxiosError(error)) {
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
        if (axios.isAxiosError(error)) {
            if (error.response?.status === HttpStatusCode.Conflict) {
                console.info("Служебный аккаунт уже создан, ничего не делаем!");
            } else {
                throw error;
            }
        }
    }
}