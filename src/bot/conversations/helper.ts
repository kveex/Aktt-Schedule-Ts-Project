import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import {cancelKeyboard, datePickKeyboard, datePickKeyboardButtons, keyboardSuggestionsKeyboard} from "../keyboards";
import { parseDate } from "../../util/helper";
import { ApiCommunicator } from "../../api";
import { Subgroup } from "../../lesson/types";
import { pretifySchedule } from "../../lesson/helper";
import { Database } from "../database";
import {BotButtons} from "../constants";

export async function getListInDialog(type: "groups" | "teachers", date: Date | null):
    Promise<{ list: string[], error: string | null }> {
        let list: string[];
        let error: string | null = null;

        try {
            list = !date ? await ApiCommunicator.getList(type) : await ApiCommunicator.getList(type, date);
        } catch {
            list = await ApiCommunicator.getList(type);
            error = "Не удалось найти информацию на указанную дату, попробую получить расписание на ближайшую дату с расписанием";
        }

        return { list, error };
}

export async function getDateInDialog(con: Conversation, ctx: Context): Promise<Date | null> {
    await ctx.reply('На какую дату нужно расписание?', { reply_markup: datePickKeyboard() })

    const { message: pickedDateOption } = await con.waitForHears(datePickKeyboardButtons);

    if (pickedDateOption?.text! === BotButtons.CUSTOM_DATE_SCHEDULE) {
        await ctx.reply(
            'Укажите желаемую дату в формате гггг-мм-дд например "2026-04-08"',
            { reply_markup: cancelKeyboard() }
        );

        while (true) {
            const { message: customDate } = await con.waitFor("message:text");
            const input = customDate.text.toLocaleLowerCase();
            try {
                return await con.external(() => {
                    return parseDate(input);
                })
            } catch {
                await ctx.reply(
                    "Дата указана не по формату или оказалась нереалистичной, попробуй снова:",
                    { reply_markup: cancelKeyboard() }
                )
            }
        }
    }
    return null;
}

export async function getScheduleForDialog(
    con: Conversation, type: "student" | "teacher", name: string, subgroup: Subgroup,
    date: Date | null, scheduleFor: string): Promise<string>
{
    const schedule = await con.external(async () => {
        return await ApiCommunicator.getSchedule({ type: type, name: name, subgroup: subgroup, scheduleDate: date });
    })

    return pretifySchedule(schedule, scheduleFor);
}

export async function getNameInDialog(
    ctx: Context, con: Conversation, list: string[], suggestionType: "group" | "teacher"): Promise<string> {
    while (true) {
        const { message } = await con.waitFor("message:text");

        const input = suggestionType === "group" ? message.text.toLowerCase() : message.text;
        const errorText: string = suggestionType === "group" ?
            "Указанная группа не найдена. Попробуйте ещё раз:" :
            "Указанный преподаватель не найден. Попробуйте ещё раз:";

        if (list.includes(input)) {
            await con.external(async () => {
                await Database.addKeyboardSuggestion(ctx.chatId!, suggestionType, input);
            });
            return input;
        } else {
            await ctx.reply(errorText, { reply_markup: cancelKeyboard() });
        }
    }
}

export async function setSuggestionsKeyboardInDialog(ctx: Context, suggestionType: "group" | "teacher") {
    const suggestionsKeyboard = await keyboardSuggestionsKeyboard(ctx.chatId!, suggestionType);

    let promptText: string;

    if (suggestionType === "group") {
        promptText = suggestionsKeyboard ? 'Напиши название группы или выбери недавно использованное:' : 'Напиши название группы:';
    } else {
        promptText = suggestionsKeyboard ? 'Напиши имя и инициалы преподавателя в формате  или выбери недавно использованное:' : 'Напиши имя и инициалы преподавателя:';
    }

    await ctx.reply(promptText, { reply_markup: suggestionsKeyboard || cancelKeyboard() });
}