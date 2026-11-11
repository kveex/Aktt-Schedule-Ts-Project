import {db, Tables} from "./client";
import {RawScheduleSubscription, ScheduleSubscription, UNIQUE_CONSTRAINT_CODE, User} from "./types";
import {ScheduleTarget, Subgroup} from "../../lesson/types";
import {MAX_SUBSCRIPTIONS_PER_USER} from "../constants";

export async function getScheduleSubscriptions(): Promise<ScheduleSubscription[]> {
    const client = db();
    const { data, error } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .select(`id, ${Tables.USERS} (id, chat_id), target, value, subgroup`);

    if (error) {
        throw error;
    }

    const rawSubscriptions = data as unknown as RawScheduleSubscription[];

    return rawSubscriptions.map(sub => ({
        id: sub.id,
        target: sub.target as ScheduleTarget,
        value: sub.value,
        user: {
            id: sub.users.id,
            chat_id: sub.users.chat_id,
            user_actions: []
        },
        subgroup: sub.subgroup as Subgroup
    }))
}

export async function getUserSubscriptions(user: User): Promise<{ subscriptions: ScheduleSubscription[], count: number }> {
    const client = db();

    const { data, count: subsCount, error } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("id", { ascending: true });

    if (data === null) {
        throw new Error(`Не удалось получить список подписок пользователя! Причина: ${error}`);
    }

    return { subscriptions: data as ScheduleSubscription[], count: subsCount! };
}

export async function removeUserSubscription(subscription: ScheduleSubscription) {
    const client = db();

    const { error } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .delete()
        .eq("id", subscription.id);

    if (error) {
        console.error(error);
    }
}

export async function createScheduleSubscription(user: User, target: ScheduleTarget, value: string, subgroup: Subgroup): Promise<void> {
    const client = db();

    /*
    В базе данных бота должен стоять ключ уникальности для корректной работы!
    ПРИМЕР SQL:
        ALTER TABLE schedule_subscriptions
        ADD CONSTRAINT unique_subscription_per_user
        UNIQUE (user_id, target, value, subgroup);
     */

    const { count: subscriptionsCount } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    if (subscriptionsCount && subscriptionsCount >= MAX_SUBSCRIPTIONS_PER_USER) {
        throw new Error("Нельзя добавить больше 5 подписок на расписания!")
    }

    const { error } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .insert({ "user_id": user.id, "target": target, "value": value, "subgroup": subgroup });

    if (error) {
        if (error.code === UNIQUE_CONSTRAINT_CODE) {
            throw new Error("Такая подписка уже есть!");
        }
        throw new Error(`Не удалось создать подписку! || ${error.message} ||`);
    }
}