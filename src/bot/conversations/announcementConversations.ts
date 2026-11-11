import {AkttBotContext, AkttBotConversation, BotButtons} from "../constants";
import {announcementKeyboard, cancelKeyboard, mainKeyboard} from "../keyboards";
import {saveAnnouncement} from "../database/announcement";
import {User} from "../database/types";
import {getUser} from "../database/users";
import {AkttBot} from "../bot";

export async function announce(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));
    if (!user.user_actions.includes("MESSENGER")) {
        await ctx.reply("У вас недостаточно прав для данного действия!", { reply_markup: await mainKeyboard(user) });
        await con.halt();
    }

    await ctx.reply("Введите текст, который хотите отправить для оповещения:", { reply_markup: cancelKeyboard() });

    const { message } = await con.waitFor([":text", ":file"]);

    const text: string = message?.text!;

    await ctx.reply(`Ваш текст будет выглядеть так:\n\n${text}`, { reply_markup: announcementKeyboard() });
    await con.waitForHears(BotButtons.SEND);

    await con.external(async () => await saveAnnouncement(user, text));

    await ctx.reply("Оповещение отправлено!", { reply_markup: await mainKeyboard(user) });
    await AkttBot.sendAnnouncement(user, text);
    await con.halt();
}