import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import {
    cancelKeyboard,
    datePickKeyboard,
    datePickKeyboardButtons,
    keyboardSuggestionsKeyboard,
    subgroupsKeyboard, subgroupsKeyboardLabels
} from "../keyboards";
import { parseDate } from "../../util/helper";
import { ApiCommunicator } from "../../api";
import { Subgroup } from "../../lesson/types";
import {prettifySchedule, stringToSubgroup} from "../../lesson/helper";
import { Database } from "../database";
import {BotButtons} from "../constants";

async function getListsInDialog(date: Date | null):
    Promise<{ groupsList: string[], teachersList: string[], error: string | null }> {
    let groupsList: string[];
    let teachersList: string[];
    let error: string | null = null;

    try {
        if (!date) {
            groupsList = await ApiCommunicator.getList("groups");
            teachersList = await ApiCommunicator.getList("teachers");
        } else {
            groupsList = await ApiCommunicator.getList("groups", date);
            teachersList = await ApiCommunicator.getList("teachers", date);
        }
    } catch {
        groupsList = await ApiCommunicator.getList("groups");
        teachersList = await ApiCommunicator.getList("teachers");
        error = "Не удалось найти информацию на указанную дату, попробую получить расписание на ближайшую дату с расписанием";
    }

    return { groupsList, teachersList, error };
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

    return prettifySchedule(schedule, scheduleFor);
}

export async function getNameInDialog(
    ctx: Context, con: Conversation, date: Date | null): Promise<{ name: string, type: "group" | "teacher" }> {
    const { groupsList, teachersList } = await con.external(async () => {
        return await getListsInDialog(date);
    })

    while (true) {
        const { message } = await con.waitFor("message:text");
        const input = message.text;
        
        const matchedGroup = groupsList.find(groupName => groupName.includes(input.toLocaleLowerCase()));
        const matchedTeacher = teachersList.find(teacherName => teacherName.includes(input));

        if (matchedGroup) {
            await con.external(async () => {
                await Database.addKeyboardSuggestion(ctx.chatId!, "group", matchedGroup.toLocaleUpperCase());
            });
            return { name: matchedGroup, type: "group" };
        } else if (matchedTeacher) {
            await con.external(async () => {
                await Database.addKeyboardSuggestion(ctx.chatId!, "teacher", matchedTeacher);
            });
            return { name: matchedTeacher, type: "teacher" };
        } else {
            await ctx.reply("Указанные группа или преподаватель не найдены! Попробуйте ещё раз:",
                { reply_markup: cancelKeyboard() }
            );
        }
    }
}

export async function setSuggestionsKeyboardInDialog(ctx: Context, suggestionType: "group" | "teacher", text?: string) {
    const suggestionsKeyboard = await keyboardSuggestionsKeyboard(ctx.chatId!, suggestionType);

    let promptText: string;

    if (suggestionType === "group") {
        promptText = suggestionsKeyboard ? 'Напиши название группы или выбери недавно использованное:' : 'Напиши название группы:';
    } else {
        promptText = suggestionsKeyboard ? 'Напиши фамилию и инициалы преподавателя или выбери недавно использованное:' : 'Напиши фамилию и инициалы преподавателя:';
    }

    if (text) {
        promptText = text;
    }

    await ctx.reply(promptText, { reply_markup: suggestionsKeyboard || cancelKeyboard() });
}

export async function getSubgroupInDialog(ctx: Context, con:Conversation): Promise<Subgroup> {
    await ctx.reply("Выбери подгруппу, для которой нужно расписание:", { reply_markup: subgroupsKeyboard() });

    const { message: subgroupMessage } = await con.waitForHears(subgroupsKeyboardLabels);

    return stringToSubgroup(subgroupMessage?.text!)!;
}