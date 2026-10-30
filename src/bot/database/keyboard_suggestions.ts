import {db, Tables} from "./client";
import {KeyboardSuggestion, UNIQUE_CONSTRAINT_CODE, User} from "./types";
import {ScheduleTarget} from "../../lesson/types";

const MAX_SUGGESTIONS_PER_USER = 3;

export async function addKeyboardSuggestion(user: User, target: ScheduleTarget, value: string) {
    const client = db();

    /*
    В базе данных бота должен стоять ключ уникальности для корректной работы!
    ПРИМЕР SQL:
        ALTER TABLE keyboard_suggestions
        ADD CONSTRAINT unique_keyboard_suggestions
        UNIQUE (user_id, target, value);
     */
    const { count: suggestionsCount } = await client
        .from(Tables.KEYBOARD_SUGGESTIONS)
        .select("*", { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (suggestionsCount && suggestionsCount >= MAX_SUGGESTIONS_PER_USER) {
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
        if (error.code !== UNIQUE_CONSTRAINT_CODE) {
            console.error('Ошибка при добавлении предложения в клавиатуру:', error);
        }
    }
}

export async function getKeyboardSuggestions(user: User, target: ScheduleTarget): Promise<KeyboardSuggestion[]> {
    const client = db();
    const { data } = await client.from(Tables.KEYBOARD_SUGGESTIONS).select().eq("user_id", user.id).eq("target", target);
    return data as KeyboardSuggestion[];
}