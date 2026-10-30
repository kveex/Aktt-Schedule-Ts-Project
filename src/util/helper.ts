import {subgroupToString} from "../lesson/helper";
import {ScheduleSubscription} from "../bot/database/types";

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

export function subscriptionsToString(subs: ScheduleSubscription[]): string {
    let text: string = "Ваши подписки: \n";

    if (subs.length <= 0) {
        return "У вас нет подписок. Их можно добавить кнопкой ниже";
    }

    for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        text += `${i+1}. ${prettifySubscription(sub!)}`
    }

    return text;
}

function prettifySubscription(sub: ScheduleSubscription): string {
    switch (sub.target) {
        case "GROUP": return `Группа: ${sub.value} | Подгруппа: ${subgroupToString(sub.subgroup)}\n`;
        case "TEACHER": return `Преподаватель: ${sub.value}\n`;
    }
}