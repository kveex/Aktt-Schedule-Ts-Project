import { Context, Keyboard } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { mainKeyboard, subgroupsKeyboard, subgroupsKeyboardLabels } from "../keyboards";
import { ApiCommunicator } from "../../api";
import { stringToSubgroup } from "../../lesson/helper";

export async function getStudentSchedule(con: Conversation, ctx: Context) {
    await ctx.reply('Напиши название группы или выбери недавно использованное:', { reply_markup: { remove_keyboard: true } });

    const groupsList: string[] = await con.external(async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        try {
            return await ApiCommunicator.getGroupsList(tomorrow);
        } catch (error) {
            return await ApiCommunicator.getGroupsList(today)
        }
    });

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

    const subgroup = stringToSubgroup(message?.text!)!;

    await ctx.reply(`Группа: ${groupName}\nПодгруппа: ${subgroup}`, { reply_markup: mainKeyboard() })
}