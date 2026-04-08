import { Conversation } from "@grammyjs/conversations";
import { Subgroup } from "../../lesson/types";
import { Context } from "grammy";
import { mainKeyboard } from "../keyboards";
import { BotButtons } from "../constants";

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