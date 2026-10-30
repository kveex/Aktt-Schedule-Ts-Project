import {db, Tables} from "./client";
import {Action, RawUser, UNIQUE_CONSTRAINT_CODE, User} from "./types";

/**
 * Создаёт пользователя в бд бота
 * @param chatId ID чата пользователя из телеграма
 * @returns Возвращает true если пользователь уже был зарегистрирован
 */
export async function createUser(chatId: number): Promise<{exists: boolean, user: User}> {
    const client = db();

    const { error } = await client
        .from(Tables.USERS)
        .insert({ chat_id: chatId });
    if (error) {
        if (error.code === UNIQUE_CONSTRAINT_CODE) {
            const user: User = await getUser(chatId);
            return {
                exists: true,
                user: user
            }
        }
        throw error;
    }

    const user: User = await getUser(chatId);

    return {
        exists: false,
        user: user
    }
}

export async function getUser(chatId: number): Promise<User> {
    const client = db();

    const { data, error } = await client
        .from(Tables.USERS)
        .select(`id, chat_id, ${Tables.USERS_ACTIONS} (action)`)
        .eq("chat_id", chatId)
        .single();

    if (error) {
        throw new Error(`Не удалось получить пользователя [${chatId}]: ${error.message}`);
    }

    const rawUser = data as RawUser;

    return {
        id: rawUser.id,
        chat_id: rawUser.chat_id,
        user_actions: rawUser.users_actions
            .map((ua) => ua.action as Action)
    }
}