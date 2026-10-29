import {db, Tables} from "./client";
import {ScheduleSubscription, User} from "./types";
import {ScheduleTarget, Subgroup} from "../../lesson/types";

const MAX_SUBSCRIPTIONS_PER_USER = 5;

export async function getScheduleSubscriptions(): Promise<ScheduleSubscription[]> {
    const client = db();
    const { data } = await client.from(Tables.SCHEDULE_SUBSCRIPTIONS).select();
    return data as ScheduleSubscription[];
}

export async function getUserSubscriptions(user: User): Promise<{ subscriptions: ScheduleSubscription[], count: number }> {
    const client = db();

    const { data, count: subsCount, error } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

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

    const { data, error: subscriptionsError } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .select("id, target, value, subgroup")
        .eq("user_id", user.id);

    if (subscriptionsError) {
        throw new Error(`Не удалось проверить подписки: ${subscriptionsError.message}`);
    }

    const subscriptions = data as ScheduleSubscription[];

    if (subscriptions.length >= MAX_SUBSCRIPTIONS_PER_USER) {
        throw new Error("У вас достигнут лимит подписок! Отпишитесь от неважных расписаний");
    }

    const hasDuplicate: boolean = subscriptions.some((subscription: ScheduleSubscription) =>
        subscription.target === target &&
        subscription.subgroup === subgroup &&
        subscription.value === value
    );

    if (hasDuplicate) {
        throw new Error("Такая подписка уже есть! Сделайте другую подписку");
    }

    const { error } = await client
        .from(Tables.SCHEDULE_SUBSCRIPTIONS)
        .insert({ "user_id": user.id, "target": target, "subgroup": subgroup });

    if (error) {
        throw new Error(`Не удалось создать подписку: ${error.message}`);
    }
}