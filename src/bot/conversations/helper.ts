import {
    cancelKeyboard,
    datePickKeyboard,
    datePickKeyboardButtons,
    makeSuggestionsKeyboard,
    subgroupsKeyboard, subgroupsKeyboardLabels
} from "../keyboards";
import { parseDate } from "../../util/helper";
import {Schedule, ScheduleTarget, Subgroup} from "../../lesson/types";
import {prettifySchedule, stringToSubgroup} from "../../lesson/helper";
import {AkttBotContext, AkttBotConversation, BotButtons} from "../constants";
import {getListAll, getSchedule} from "../../api/schedule";
import {addKeyboardSuggestion} from "../database/keyboard_suggestions";
import {User} from "../database/types";

export async function getDateInDialog(con: AkttBotConversation, ctx: AkttBotContext): Promise<Date | null> {
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
    con: AkttBotConversation, target: ScheduleTarget, value: string, subgroup: Subgroup,
    date: Date | null): Promise<string>
{
    const schedule: Schedule = await con.external(async () => {
        return await getSchedule({value: value, target: target, scheduleDate: date, subgroup: subgroup})
    })

    return prettifySchedule(schedule, target, value);
}

export async function getNameInDialog(
    ctx: AkttBotContext, con: AkttBotConversation, user: User): Promise<{ name: string, target: ScheduleTarget }> {
    const { groups, teachers } = await con.external(async () => {
        return await getListAll();
    })

    while (true) {
        const { message } = await con.waitFor("message:text");
        const input: string = message.text;
        
        const matchedGroup = groups.find(groupName => groupName.includes(input.toLocaleLowerCase()));
        const matchedTeacher = teachers.find(teacherName => teacherName.includes(input));

        if (matchedGroup) {
            await con.external(async () => {
                await addKeyboardSuggestion(user, "GROUP", matchedGroup.toLocaleUpperCase());
            });
            return { name: matchedGroup, target: "GROUP" };
        } else if (matchedTeacher) {
            await con.external(async () => {
                await addKeyboardSuggestion(user, "TEACHER", matchedTeacher);
            });
            return { name: matchedTeacher, target: "TEACHER" };
        } else {
            await ctx.reply("Указанные группа или преподаватель не найдены! Попробуйте ещё раз:",
                { reply_markup: cancelKeyboard() }
            );
        }
    }
}

export async function setSuggestionsKeyboardInDialog(ctx: AkttBotContext, con: AkttBotConversation, target: ScheduleTarget, user: User, text?: string) {
    const suggestionsKeyboard = await con.external(async () => await makeSuggestionsKeyboard(user, target))

    let promptText: string;

    switch (target) {
        case "GROUP": {
            promptText = suggestionsKeyboard ? 'Напиши название группы или выбери недавно использованное:' : 'Напиши название группы:';
            break;
        }
        case "TEACHER": {
            promptText = suggestionsKeyboard ? 'Напиши фамилию и инициалы преподавателя или выбери недавно использованное:' : 'Напиши фамилию и инициалы преподавателя:';
            break;
        }
    }

    if (text) {
        promptText = text;
    }

    await ctx.reply(promptText, { reply_markup: suggestionsKeyboard || cancelKeyboard() });
}

export async function getSubgroupInDialog(ctx: AkttBotContext, con: AkttBotConversation): Promise<Subgroup> {
    await ctx.reply("Выбери подгруппу, для которой нужно расписание:", { reply_markup: subgroupsKeyboard() });

    const { message: subgroupMessage } = await con.waitForHears(subgroupsKeyboardLabels);

    return stringToSubgroup(subgroupMessage?.text!)!;
}