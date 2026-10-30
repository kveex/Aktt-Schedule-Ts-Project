import {CommandContext, Context} from "grammy";
import {createUser} from "../database/users";
import {ConversationFlavor} from "@grammyjs/conversations";
import {mainKeyboard} from "../keyboards";

export async function handleStart(ctx: CommandContext<ConversationFlavor<Context>>): Promise<void> {
    const { exists, user } = await createUser(ctx.chatId);
    //TODO: Написать приветствие с предупреждением о том, как работает бот, на первое появление пользователя, а дальше просто
    // выводить приветствие

    const greetMessage: string = exists ? "С возвращением!" : "Добро пожаловать!";

    await ctx.reply(greetMessage, { reply_markup: await mainKeyboard(user) });
}