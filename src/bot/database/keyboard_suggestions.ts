import {db, Tables} from "./client";
import {KeyboardSuggestion, User} from "./types";
import {ScheduleTarget} from "../../lesson/types";

export async function addKeyboardSuggestion(user: User, target: ScheduleTarget, value: string) {
    const client = db();

    const { count } = await client
        .from(Tables.KEYBOARD_SUGGESTIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (count && count > 3) {
        const { data: oldest } = await client
            .from(Tables.KEYBOARD_SUGGESTIONS)
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (oldest) {
            await client
                .from(Tables.KEYBOARD_SUGGESTIONS)
                .delete()
                .eq('id', oldest.id);
        }
    }

    const { error } = await client.from(Tables.KEYBOARD_SUGGESTIONS).insert({"user_id": user.id, "target": target, "value": value});

    if (error) {
        if (error.code !== '23505') {
            console.error('Ошибка при добавлении предложения в клавиатуру:', error);
        }
    }
}

export async function getKeyboardSuggestions(user: User, target: ScheduleTarget): Promise<KeyboardSuggestion[]> {
    const client = db();
    const { data } = await client.from(Tables.KEYBOARD_SUGGESTIONS).select().eq("user_id", user.id).eq("target", target);
    return data as KeyboardSuggestion[];
}