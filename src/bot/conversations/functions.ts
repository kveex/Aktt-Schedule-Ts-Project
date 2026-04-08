import { Context, Keyboard } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { mainKeyboard, subgroupsKeyboard, subgroupsKeyboardLabels } from "../keyboards";
import { ApiCommunicator } from "../../api";
import { stringToSubgroup } from "../../lesson/helper";
import { getSchedule } from "./helper";

export async function getStudentSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('Напиши название группы или выбери недавно использованное:', { reply_markup: { remove_keyboard: true } });

    const groupsList: string[] = await con.external(async () => {
        return getSchedule(ApiCommunicator.getGroupsList);
    });
    
    if(groupsList.length === 0) return ctx.reply('Не удалось получить список преподавателей')
    let groupName: string | null = null;

    while (!groupName) {
        const { message } = await con.waitFor("message:text");

        const input = message.text.toLocaleLowerCase();

        if (groupsList.includes(input)) {
            groupName = input;
        } else {
            await ctx.reply("Указанная группа не найдена. Попробуйте ещё раз:")
        }
    }
    
    await ctx.reply("Выбери подгруппу, для которой нужно расписание:", { reply_markup: subgroupsKeyboard() })

    const {message} = await con.waitForHears(subgroupsKeyboardLabels)

    const subgroup = stringToSubgroup(message?.text!);

    await ctx.reply(`Группа: ${groupName}\nПодгруппа: ${subgroup}`, { reply_markup: mainKeyboard() })
}
export async function getTeacherSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('Напиши ФИО преподавателя или выбери недавно использованое:', {reply_markup: {remove_keyboard: true}})

    const teachersList: string[] = await con.external(async () => {
        return getSchedule(ApiCommunicator.getTeachersList);
    });
    let teacherName: string | null = null;
    
    if(teachersList.length === 0) return ctx.reply('Не удалось получить список преподавателей')

    while(!teacherName){
        const {message} = await con.waitFor("message:text")
        const input = message?.text.toLocaleLowerCase();
        if(teachersList.includes(input)){
            teacherName = input
        } else{
            await ctx.reply("Преподаватель не найден. Попробуйте еще раз")
        }
    }
}