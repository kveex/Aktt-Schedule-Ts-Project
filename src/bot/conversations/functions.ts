import { Context } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { cancelKeyboard, datePickKeyboard, datePickKeyboardButtons, keyboardSuggestionsKeyboard, mainKeyboard, subgroupsKeyboard, subgroupsKeyboardLabels } from "../keyboards";
import { ApiCommunicator } from "../../api";
import { stringToSubgroup } from "../../lesson/helper";
import { BotButtons } from "../constants";
import { Database } from "../database";
import {getDateInDialog, getListInDialog, getScheduleForDialog} from "./helper";

export async function getStudentSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('На какую дату нужно расписание?', { reply_markup: datePickKeyboard() })

    const { message: pickedDateOption } = await con.waitForHears(datePickKeyboardButtons);

    let tomorrow: Date | null = null;

    if (pickedDateOption?.text! === BotButtons.CUSTOM_DATE_SCHEDULE) {
        tomorrow =  await getDateInDialog(con, ctx)
    }

    const { groupsList, error } = await con.external(async () => {
        return await getListInDialog("groups", tomorrow);
    });

    if (error) {
        await ctx.reply(error);
        tomorrow = null;
    }

    const suggestionsKeyboard = await keyboardSuggestionsKeyboard(ctx.chatId!, "group");

    const promptText = suggestionsKeyboard ? 'Напиши название группы или выбери недавно использованное:' : 'Напиши название группы:';
    await ctx.reply(promptText, { reply_markup: suggestionsKeyboard || cancelKeyboard() });
    
    let groupName: string | null = null;

    while (!groupName) {
        const { message } = await con.waitFor("message:text");

        const input = message.text.toLowerCase();
        
        if (groupsList.includes(input)) {
            groupName = input;

            await con.external(async () => {
                await Database.addKeyboardSuggestion(ctx.chatId!, "group", input);
            });
        } else {
            await ctx.reply("Указанная группа не найдена. Попробуйте ещё раз:", { reply_markup: cancelKeyboard() });
        }
    }
    
    await ctx.reply("Выбери подгруппу, для которой нужно расписание:", { reply_markup: subgroupsKeyboard() });

    const { message: subgroupMessage } = await con.waitForHears(subgroupsKeyboardLabels);

    const subgroup = stringToSubgroup(subgroupMessage?.text!)!;

    const schedule: string = await getScheduleForDialog(con, "student", groupName, subgroup, tomorrow, `группы ${groupName}`)

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })
    
    await con.halt();
}

export async function getTeacherSchedule(con: Conversation, ctx: Context) {


    await ctx.reply('На какую дату нужно расписание?', { reply_markup: datePickKeyboard() })

    const { message: pickedDateOption } = await con.waitForHears(datePickKeyboardButtons);

    let tomorrow: Date | null = null;

    if (pickedDateOption?.text! === BotButtons.CUSTOM_DATE_SCHEDULE) {
        tomorrow = await getDateInDialog(con, ctx)
    }


    await ctx.reply('Напиши ФИО преподавателя или выбери недавно использованое:', {reply_markup: {remove_keyboard: true}})

    const teachersList: string[] = await con.external(async () => {
        return ApiCommunicator.getList("teachers");
    });
    let teacherName: string | null = null;
    
    if(teachersList.length === 0) return ctx.reply('Не удалось получить список преподавателей')

    while(!teacherName){
        const { message } = await con.waitFor("message:text")
        const input = message?.text.toLocaleLowerCase();
        console.log(teachersList)
        if(teachersList.includes(input)){
            teacherName = input
        } else{
            await ctx.reply("Преподаватель не найден. Попробуйте еще раз")
        }
    }


}