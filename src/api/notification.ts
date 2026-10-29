import {apiClient} from "./client";
import axios, {HttpStatusCode} from "axios";

export async function subscribeToNotifications(webhookPath: string): Promise<void> {
    try {
        await apiClient.put("/notification", {
            callbackUrl: webhookPath,
            mode: "ONLY_NEW"
        });
        console.info("Подписка на уведомления оформлена успешно!")
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === HttpStatusCode.BadRequest) {
                console.error(error.response?.data.error);
                console.warn("Бот продолжит работать, но расписания можно получить только вручную!");
            } else if (error.code === 'EACCES') {
                throw new Error("Не удалось отправить запрос к AKTT API, вероятно оно не запущено!")
            }
        }
    }
}