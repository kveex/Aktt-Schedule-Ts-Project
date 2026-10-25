import {NextFunction} from "grammy";
import {AkttBotContext, BotButtons} from "../constants";
import {mainKeyboard} from "../keyboards";

export async function handleCancelConversation(ctx: AkttBotContext, next: NextFunction): Promise<void> {
    if (ctx.message?.text === BotButtons.CANCEL) {
        await ctx.reply("Действие отменено.", { reply_markup: mainKeyboard() });
        await ctx.conversation.exitAll();
        return;
    }
    await next();
}