import { Conversation } from "@grammyjs/conversations";
import { Subgroup } from "../../lesson/types";
import { Context } from "grammy";
import { mainKeyboard } from "../keyboards";
import { BotButtons } from "../constants";
import { cancelKeyboard } from "../keyboards";
import { parseDate } from "../../util/helper";
export async function getList<T>(fetcher: (date: Date) => Promise<T>) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        try {
            return await fetcher(tomorrow);
        } catch (error) {
            return await fetcher(today)
        }
}

export async function tryFinishConversation(con: Conversation, ctx: Context, cancelingText: string): Promise<boolean> {
    let success: boolean = false;
    if (cancelingText === BotButtons.CANCEL.toLocaleLowerCase()) {
        success = true;
        await ctx.reply("Запрос расписания отменен.", { reply_markup: mainKeyboard() });
        await con.halt();
    }
    return success;
}

export async function getDateSchedule(con: Conversation, ctx: Context){
    await ctx.reply('Укажите желаемую дату в формате гггг-мм-дд например "2026-04-08"', { reply_markup: cancelKeyboard() });
    let tomorrow: Date | null = null;
    while (!tomorrow) {
                const { message: customDate } = await con.waitFor("message:text");
                const input = customDate.text.toLocaleLowerCase();
    
            try {
                tomorrow = await con.external(() => { 
                const customDate: Date = parseDate(input);
                return customDate;
                })
                return tomorrow
            } catch {
                await ctx.reply("Дата указана не по формату или оказалась нереалистичной, попробуй снова:", { reply_markup: cancelKeyboard() })
            }
    }
    return tomorrow
}
