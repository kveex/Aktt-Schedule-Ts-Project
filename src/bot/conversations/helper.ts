import {Conversation} from "@grammyjs/conversations";
import {Context} from "grammy";
import {cancelKeyboard} from "../keyboards";
import {parseDate} from "../../util/helper";
import {ApiCommunicator} from "../../api";
import {Subgroup} from "../../lesson/types";
import {pretifySchedule} from "../../lesson/helper";

export async function getListInDialog(type: "groups" | "teachers", date: Date | null):
    Promise<{ groupsList: string[], error: string | null }> {
        let groupsList: string[];
        let error: string | null = null;

        try {
            groupsList = !date ? await ApiCommunicator.getList(type) : await ApiCommunicator.getList(type, date);
        } catch {
            groupsList = await ApiCommunicator.getList(type);
            error = "Не удалось найти информацию на указанную дату, попробую получить расписание на ближайшую дату с расписанием";
        }

        return { groupsList, error };
}

export async function getDateInDialog(con: Conversation, ctx: Context) {
    await ctx.reply('Укажите желаемую дату в формате гггг-мм-дд например "2026-04-08"', { reply_markup: cancelKeyboard() });
    while (true) {
        const { message: customDate } = await con.waitFor("message:text");
        const input = customDate.text.toLocaleLowerCase();
        try {
            return await con.external(() => {
                return parseDate(input);
            })

        } catch {
            await ctx.reply("Дата указана не по формату или оказалась нереалистичной, попробуй снова:", { reply_markup: cancelKeyboard() })
        }
    }
}

export async function getScheduleForDialog(con: Conversation, type: "student" | "teacher", name: string, subgroup: Subgroup, date: Date | null, scheduleFor: string): Promise<string> {
    const schedule = await con.external(async () => {
        return await ApiCommunicator.getSchedule({ type: type, name: name, subgroup: subgroup, scheduleDate: date });
    })

    return pretifySchedule(schedule, scheduleFor);
}
