import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const Tables = {
    SCHEDULE_SUBSCRIPTIONS: "schedule_subscriptions",
    KEYBOARD_SUGGESTIONS: "keyboard_suggestions",
    USERS: "users",
    USERS_ACTIONS: "users_actions"
} as const;

let client: SupabaseClient | null = null;

export function databaseInit(url: string, key: string): void {
    client = createClient(url, key);
    console.log("Подключение к базе данных успешно!")
}

export function db(): SupabaseClient {
    if (!client) throw new Error("Клиент базы данных не инициализирован!");
    return client;
}
