import { Context } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { cancelKeyboard, datePickKeyboard, datePickKeyboardButtons, keyboardSuggestionsKeyboard, mainKeyboard, subgroupsKeyboard, subgroupsKeyboardLabels } from "../keyboards";
import { ApiCommunicator } from "../../api";
import { pretifySchedule, stringToSubgroup } from "../../lesson/helper";
import { tryFinishConversation } from "./helper";
import { parseDate } from "../../util/helper";
import { BotButtons } from "../constants";

export async function getStudentSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('На какую дату нужно расписание?', { reply_markup: datePickKeyboard() })

    const { message: pickedDateOption } = await con.waitForHears(datePickKeyboardButtons);

    await tryFinishConversation(con, ctx, pickedDateOption?.text!)

    let tomorrow: Date | null = null;

    if (pickedDateOption?.text! === BotButtons.CUSTOM_DATE_SCHEDULE) {
        await ctx.reply('Укажите желаемую дату в формате гггг-мм-дд например "2026-04-08"');

        while (!tomorrow) {
            const { message: customDate } = await con.waitFor("message:text");
            
            const input = customDate.text.toLocaleLowerCase();

            await tryFinishConversation(con, ctx, input);

            try {
                tomorrow = await con.external(() => { return parseDate(input) })
            } catch {
                await ctx.reply("Дата указана не по формату или оказалась нереалистичной, попробуй снова:", { reply_markup: cancelKeyboard() })
            }
        }
    }

    await ctx.reply('Напиши название группы или выбери недавно использованное:', { reply_markup: await keyboardSuggestionsKeyboard(ctx.chatId!, "group") });
    
    const groupsList: string[] = await con.external(async () => {
        const list = !tomorrow ? ApiCommunicator.getList("groups") : ApiCommunicator.getList("groups", tomorrow);
        return list;
    });
    
    if (groupsList.length === 0) return ctx.reply('Не удалось получить список преподавателей');
    let groupName: string | null = null;

    while (!groupName) {
        const { message } = await con.waitFor("message:text");

        const input = message.text.toLocaleLowerCase();

        await tryFinishConversation(con, ctx, input);

        if (groupsList.includes(input)) {
            groupName = input;
        } else {
            await ctx.reply("Указанная группа не найдена. Попробуйте ещё раз:", { reply_markup: cancelKeyboard() });
        }
    }
    
    await ctx.reply("Выбери подгруппу, для которой нужно расписание:", { reply_markup: subgroupsKeyboard() });

    const { message: subgroupMessage } = await con.waitForHears(subgroupsKeyboardLabels);

    await tryFinishConversation(con, ctx, subgroupMessage?.text!)

    const subgroup = stringToSubgroup(subgroupMessage?.text!)!;

    const schedule = await con.external(async () => {
        return await ApiCommunicator.getSchedule({ type: "student", name: groupName, subgroup: subgroup });
    })

    await ctx.reply(pretifySchedule(schedule, `группы ${groupName}`), { reply_markup: mainKeyboard() })
}
export async function getTeacherSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('Напиши ФИО преподавателя или выбери недавно использованое:', {reply_markup: {remove_keyboard: true}})

    const teachersList: string[] = await con.external(async () => {
        return ApiCommunicator.getList("teachers");
    });
    let teacherName: string | null = null;
    
    if(teachersList.length === 0) return ctx.reply('Не удалось получить список преподавателей')

    while(!teacherName){
        const { message } = await con.waitFor("message:text")
        const input = message?.text.toLocaleLowerCase();
        if(teachersList.includes(input)){
            teacherName = input
        } else{
            await ctx.reply("Преподаватель не найден. Попробуйте еще раз")
        }
    }
}