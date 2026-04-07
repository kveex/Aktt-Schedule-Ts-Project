import {SupabaseClient} from "@supabase/supabase-js";
import { Subgroup } from "../lesson/types";

export interface ScheduleSubscription {
    id: number,
    chatId: number,
    groupName: string | null,
    teacherName: string | null,
    subgroup: Subgroup
}

const Tables = {
    SCHEDULE_SUBSCRIPTION: "schedule_subscriptions",
    KEYBOARD_SUGESTIONS: "keyboard_sugestions"
} as const;

//TODO: сделать предложения для быстрого выбора в клавиатуру. Сохранить для каждого пользователя по 3 максимум предложения для групп и преподавателей

export async function getScheduleSubscriptions(client: SupabaseClient): Promise<ScheduleSubscription[]> {
    const {data} = await client.from(Tables.SCHEDULE_SUBSCRIPTION).select();
    return data as ScheduleSubscription[];
}

export async function getUserSubscriptions(client: SupabaseClient, chatId: number): Promise<ScheduleSubscription[]> {
    const {data} = await client.from(Tables.SCHEDULE_SUBSCRIPTION).select().eq("chat_id", chatId);
    return data as ScheduleSubscription[];
}

export async function removeUserSubscription(client: SupabaseClient, subscriptionId: number) {
    const response = await client.from(Tables.SCHEDULE_SUBSCRIPTION).delete().eq("id", subscriptionId);
    console.info(`Удалена подписка, содержимое response: ${response}`)
    createUserSubscription({client, chatId: 1, teacherName: 'reareaeraaer'})
}

export async function createUserSubscription({client, chatId, groupName, teacherName, subgroup}: {
    client: SupabaseClient;
    chatId: number;
    groupName?: string;
    teacherName?: string;
    subgroup?: Subgroup;
}) {
    const { error } = await client.from(Tables.SCHEDULE_SUBSCRIPTION).insert({"chat_id": chatId, "group_name": groupName, "teacher_name": teacherName, "sub_group": subgroup});
    if (error) {
        console.error(error)
    }
}

