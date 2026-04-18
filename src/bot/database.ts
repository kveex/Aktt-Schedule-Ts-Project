import {createClient, SupabaseClient} from "@supabase/supabase-js";
import { Subgroup } from "../lesson/types";
import {stringToSubgroup, subgroupToString} from "../lesson/helper";

export interface ScheduleSubscription {
    id: number,
    chat_id: number,
    group_name: string | null,
    teacher_name: string | null,
    sub_group: Subgroup
}

const Tables = {
    SCHEDULE_SUBSCRIPTION: "schedule_subscriptions",
    KEYBOARD_SUGGESTIONS: "keyboard_suggestions"
} as const;

export interface KeyboardSuggestion {
    id: number,
    chat_id: number,
    type: "GROUP" | "TEACHER",
    value: string,
    created_at: string
}

export class Database {
    private static client: SupabaseClient;
    private static readonly MAX_SUBSCRIPTIONS_PER_USER = 5;

    private constructor(supabase_url: string, supabase_key: string) {
        Database.client = createClient(supabase_url, supabase_key);
    }

    public static initialize(supabase_url: string, supabase_key: string) {
        new this(supabase_url, supabase_key);
        console.log("Подключение к базе данных успешно!");
    }

    public static async getScheduleSubscriptions(): Promise<ScheduleSubscription[]> {
        const { data } = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).select();
        return await this.mapSubscription(data!);
    }
    
    public static async getUserSubscriptions(chatId: number): Promise<{ subscriptions: ScheduleSubscription[], count: number }> {
        const { data, count: subsCount, error } = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).select("*", { count: "exact" }).eq("chat_id", chatId);

        if (data === null) {
            throw new Error(`Не удалось получить список подписок пользователя! Причина: ${error}`);
        }

        const subs = await this.mapSubscription(data!);
        return { subscriptions: subs, count: subsCount! };
    }
    
    public static async removeUserSubscription(subscriptionId: number) {
        const response = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).delete().eq("id", subscriptionId);
        console.info(`Удалена подписка, содержимое response: ${response.data}`);
    }
    
    public static async createUserSubscription(chatId: number, groupName: string | null, teacherName: string | null, subgroup: Subgroup) {
        const strSubgroup = subgroupToString(subgroup, "database");

        const { data: subscriptions, error: subscriptionsError } = await this.client
            .from(Tables.SCHEDULE_SUBSCRIPTION)
            .select("id, group_name, teacher_name, sub_group")
            .eq("chat_id", chatId);

        if (subscriptionsError) {
            throw new Error(`Не удалось проверить подписки: ${subscriptionsError.message}`);
        }

        if (subscriptions.length >= this.MAX_SUBSCRIPTIONS_PER_USER) {
            throw new Error("У вас достигнут лимит подписок! Отпишитесь от неважных расписаний");
        }

        const hasDuplicate = subscriptions.some((subscription) =>
            subscription.group_name === groupName &&
            subscription.teacher_name === teacherName &&
            subscription.sub_group === strSubgroup
        );

        if (hasDuplicate) {
            throw new Error("Такая подписка уже есть! Сделайте другую подписку");
        }

        const { error } = await this.client
            .from(Tables.SCHEDULE_SUBSCRIPTION)
            .insert({ "chat_id": chatId, "group_name": groupName, "teacher_name": teacherName, "sub_group": strSubgroup });

        if (error) {
            throw new Error(`Не удалось создать подписку: ${error.message}`);
        }
    }

    public static async addKeyboardSuggestion(chatId: number, type: "group" | "teacher", value: string) {
        const { count } = await this.client.from(Tables.KEYBOARD_SUGGESTIONS).select('*', { count: 'exact', head: true }).eq('chat_id', chatId);
    
        if (count && count >= 3) {
            const { data: oldest } = await this.client
                .from(Tables.KEYBOARD_SUGGESTIONS)
                .select('id')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
    
            if (oldest) {
                await this.client
                    .from(Tables.KEYBOARD_SUGGESTIONS)
                    .delete()
                    .eq('id', oldest.id);
            }
        }
    
        const { error } = await this.client.from(Tables.KEYBOARD_SUGGESTIONS).insert({"chat_id": chatId, "type": type, "value": value});
        
        if (error) {
            if (error.code !== '23505') {
                console.error('Ошибка при добавлении предложения в клавиатуру:', error);
            }
        }
    }
    
    public static async getKeyboardSuggestions(chatId: number, type: "group" | "teacher"): Promise<KeyboardSuggestion[]> {
        const { data } = await this.client.from(Tables.KEYBOARD_SUGGESTIONS).select().eq("chat_id", chatId).eq("type", type);
        return data as KeyboardSuggestion[];
    }
    
    private static async mapSubscription(data: any[]): Promise<ScheduleSubscription[]> {
        return data.map((item: any): ScheduleSubscription => ({
            ...item,
            sub_group: stringToSubgroup(item.sub_group)
        }));
    }
}


