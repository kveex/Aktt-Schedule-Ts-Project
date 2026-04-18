import {ScheduleSubscription} from "../bot/database";
import {subgroupToString} from "../lesson/helper";

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

    for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        text += `${i+1}. ${prettifySubscription(sub!)}`
    }

    return text;
}

function prettifySubscription(sub: ScheduleSubscription): string {
    if (sub.group_name !== null) {
        return `Группа: ${sub.group_name} | Подгруппа: ${subgroupToString(sub.sub_group, "text")}\n`;
    } else if (sub.teacher_name !== null) {
        return `Преподаватель: ${sub.teacher_name}\n`;
    } else {
        return "";
    }
}