import {createClient, SupabaseClient} from "@supabase/supabase-js";
import { Subgroup } from "../lesson/types";
import { stringToSubgroup } from "../lesson/helper";

export interface ScheduleSubscription {
    id: number,
    chat_id: number,
    group_name: string | null,
    teacher_name: string | null,
    sub_group: Subgroup
}

const Tables = {
    SCHEDULE_SUBSCRIPTION: "schedule_subscriptions",
    KEYBOARD_SUGESTIONS: "keyboard_sugestions"
} as const;

export interface KeyboardSuggestion {
    id: number,
    chat_id: number,
    type: "GROUP" | "TEACHER",
    value: string,
    created_at: string
}

//TODO: сделать предложения для быстрого выбора в клавиатуру. Сохранить для каждого пользователя по 3 максимум предложения для групп и преподавателей

export class Database {
    private static _instance: Database;
    private static client: SupabaseClient;

    private constructor(supabase_url: string, supabase_key: string) {
        Database.client = createClient(supabase_url, supabase_key);
    }

    public static initialize(supabase_url: string, supabase_key: string) {
        this._instance = new this(supabase_url, supabase_key);
        console.log("Подключение к базе данных успешно!");
    }

    public static get Instance() {
        return this._instance;
    }
    public static async getScheduleSubscriptions(): Promise<ScheduleSubscription[]> {
        const { data } = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).select();
        return await this.mapSubscription(data!);
    }
    
    public static async getUserSubscriptions(chatId: number): Promise<ScheduleSubscription[]> {
        const {data} = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).select().eq("chat_id", chatId);
        return await this.mapSubscription(data!);
    }
    
    public static async removeUserSubscription(subscriptionId: number) {
        const response = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).delete().eq("id", subscriptionId);
        console.info(`Удалена подписка, содержимое response: ${response}`);
    }
    
    public static async createUserSubscription({chatId, groupName, teacherName, subgroup}: {
        chatId: number;
        groupName?: string;
        teacherName?: string;
        subgroup?: Subgroup;
    }) {
        const { count } = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).select("*", { count: "exact" }).eq("chat_id", chatId);
    
        if (count && count >= 5) {
            throw new Error("У пользователя достигнут лимит подписок!");
        }
    
        const { error } = await this.client.from(Tables.SCHEDULE_SUBSCRIPTION).insert({"chat_id": chatId, "group_name": groupName, "teacher_name": teacherName, "sub_group": subgroup});
    
        if (error) {
            console.error(error);
        }
    }
    
    public static async addKeyboardSuggestion(chatId: number, type: "group" | "teacher", value: string) {
        const { count } = await this.client.from('schedule_subscriptions').select('*', { count: 'exact', head: true }).eq('chat_id', chatId);
    
        if (count && count >= 3) {
            const { data: oldest } = await this.client
                .from(Tables.KEYBOARD_SUGESTIONS)
                .select('id')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();
    
            if (oldest) {
                await this.client
                    .from(Tables.KEYBOARD_SUGESTIONS)
                    .delete()
                    .eq('id', oldest.id);
            }
        }
    
        const { error } = await this.client.from(Tables.KEYBOARD_SUGESTIONS).insert({"chat_id": chatId, "type": type, "value": value});
    
        if (error) {
            console.error(error);
        }
    }
    
    public static async getKeyboardSuggestions(chatId: number, type: "group" | "teacher"): Promise<KeyboardSuggestion[]> {
        const { data } = await this.client.from(Tables.KEYBOARD_SUGESTIONS).select().eq("chat_id", chatId).eq("type", type);
        return data as KeyboardSuggestion[];
    }
    
    private static async mapSubscription(data: any[]): Promise<ScheduleSubscription[]> {
        return data.map((item: any): ScheduleSubscription => ({
            ...item,
            sub_group: stringToSubgroup(item.sub_group)
        }));
    }
}

