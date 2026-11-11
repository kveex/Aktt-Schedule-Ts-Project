import {subgroupToString} from "../lesson/helper";
import {ScheduleSubscription} from "../bot/database/types";
import {MAX_SUBSCRIPTIONS_PER_USER} from "../bot/constants";

export function parseDate(date: string): Date {
    const [year, month, day]: number[] = date.split('-').map(Number);
    if (year === undefined || year < 2000 || year > new Date().getUTCFullYear()) {
        throw new Error("Не удалось перевести год из строки в число.")
    }
    if (month === undefined) {
        throw new Error("Не удалось перевести месяц из строки в число.")
    }
    if (day == undefined || (day < 1 || day > 31)) {
        throw new Error("Не удалось перевести день из строки в число.")
    }
    
    return new Date(Date.UTC(year, month - 1, day));
}

export function dateToString(date: Date): string {
    let dateSplit = date.toISOString().split('T');
    if(!dateSplit[0]) throw new Error('')
    return dateSplit[0]
}

export function subscriptionLabel(sub: ScheduleSubscription): string {
    switch (sub.target) {
        case "GROUP": return `Группа ${sub.value} · ${subgroupToString(sub.subgroup)}`;
        case "TEACHER": return `Преподаватель ${sub.value}`;
    }
}

export function subscriptionsToString(subs: ScheduleSubscription[]): string {
    if (subs.length <= 0) {
        return "У вас нет подписок.\nНажмите «Добавить подписку», чтобы создать.";
    }

    return `Ваши подписки (${subs.length} из ${MAX_SUBSCRIPTIONS_PER_USER})\n\nНажмите на подписку, чтобы открыть её.`;
}

export function subscriptionCardText(sub: ScheduleSubscription): string {
    let text: string = "Подписка";

    text += `\n\nТип: ${sub.target === "GROUP" ? "группа" : "преподаватель"}`;
    text += `\nЗначение: ${sub.value}`;

    if (sub.target === "GROUP") {
        text += `\nПодгруппа: ${subgroupToString(sub.subgroup)}`;
    }

    return text;
}

export function subscriptionConfirmText(sub: ScheduleSubscription): string {
    return `Удалить эту подписку?\n\n${subscriptionLabel(sub)}`;
}