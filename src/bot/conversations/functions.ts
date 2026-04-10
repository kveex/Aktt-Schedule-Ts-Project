import { Context } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { cancelKeyboard, datePickKeyboard, datePickKeyboardButtons, keyboardSuggestionsKeyboard, mainKeyboard, subgroupsKeyboard, subgroupsKeyboardLabels } from "../keyboards";
import { ApiCommunicator } from "../../api";
import { pretifySchedule, stringToSubgroup } from "../../lesson/helper";
import { parseDate } from "../../util/helper";
import { BotButtons } from "../constants";
import { Database } from "../database";
import { getDateSchedule } from "./helper";

export async function getStudentSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('На какую дату нужно расписание?', { reply_markup: datePickKeyboard() })

    const { message: pickedDateOption } = await con.waitForHears(datePickKeyboardButtons);

    let tomorrow: Date | null = null;

    if (pickedDateOption?.text! === BotButtons.CUSTOM_DATE_SCHEDULE) {
        tomorrow =  await getDateSchedule(con, ctx)
    }
    
    let groupsList: string[];
    
    try {
        groupsList = await con.external(async () => {
            const list = !tomorrow ? await ApiCommunicator.getList("groups") : await ApiCommunicator.getList("groups", tomorrow);
            return list;
        });
    } catch {
        await ctx.reply("Не удалось найти информацию на указанную дату, попробую получить расписание на ближайшую дату с расписанием");
        tomorrow = null;
        groupsList = await con.external(async () => {            
            const list = await ApiCommunicator.getList("groups");
            return list;
        });
    }

    const suggestionsKeyboard = await keyboardSuggestionsKeyboard(ctx.chatId!, "group"); //Раскладка клавиатуры

    const promptText = suggestionsKeyboard ? 'Напиши название группы или выбери недавно использованное:' : 'Напиши название группы:';

    await ctx.reply(promptText, { reply_markup: suggestionsKeyboard || cancelKeyboard() });
    
    let groupName: string | null = null;

    while (!groupName) {
        const { message } = await con.waitFor("message:text");

        const input = message.text.toLocaleLowerCase();

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

    const schedule = await con.external(async () => {
        return await ApiCommunicator.getSchedule({ type: "student", name: groupName, subgroup: subgroup, scheduleDate: tomorrow });
    })

    await ctx.reply(pretifySchedule(schedule, `группы ${groupName}`), { reply_markup: mainKeyboard() })
    
    return;
}

export async function getTeacherSchedule(con: Conversation, ctx: Context) {


    await ctx.reply('На какую дату нужно расписание?', { reply_markup: datePickKeyboard() })

    const { message: pickedDateOption } = await con.waitForHears(datePickKeyboardButtons);

    let tomorrow: Date | null = null;

    if (pickedDateOption?.text! === BotButtons.CUSTOM_DATE_SCHEDULE) {
        tomorrow =  await getDateSchedule(con, ctx)
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