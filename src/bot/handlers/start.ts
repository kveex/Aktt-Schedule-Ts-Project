import {CommandContext, Context} from "grammy";
import {createUser} from "../database/users";
import {ConversationFlavor} from "@grammyjs/conversations";

export async function handleStart(ctx: CommandContext<ConversationFlavor<Context>>): Promise<void> {
    const registered: boolean = await createUser(ctx.chatId);
    //TODO: Написать приветствие с предупреждением о том, как работает бот, на первое появление пользователя, а дальше просто
    // выводить приветствие

    const greetMessage: string = registered ? "С возвращением!" : "Добро пожаловать!";

    await ctx.reply(greetMessage);
}