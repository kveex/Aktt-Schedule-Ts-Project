import {
    cancelKeyboard,
    mainKeyboard,
} from "../keyboards";
import {
    getDateInDialog,
    getNameInDialog,
    getScheduleForDialog,
    getSubgroupInDialog,
    setSuggestionsKeyboardInDialog
} from "./helper";
import {Subgroup} from "../../lesson/types";
import {AkttBotContext, AkttBotConversation} from "../constants";
import {User} from "../database/types";
import {getUser} from "../database/users";
import {postPdf} from "../../api/schedule";

export async function sendPdfSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));

    if (!user.user_actions.includes("SCHEDULE_SENDER")) {
        await ctx.reply("У вас недостаточно прав для данного действия!", { reply_markup: await mainKeyboard(user) });
        await con.halt();
    }

    await ctx.reply("Отправьте PDF файл с расписанием:", { reply_markup: cancelKeyboard() });

    let document;

    while (true) {
        const { message } = await con.waitFor(":document");
        document = message!.document;

        if (document?.mime_type === "application/pdf") {
            break;
        }

        await ctx.reply("Отправлен не PDF файл!");
    }

     const isReceived: boolean = await con.external(async () => {
        const file = await ctx.api.getFile(document.file_id);

        if (!file.file_path) {
            throw new Error("Telegram не вернул путь к файлу");
        }

        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        const tgResponse = await fetch(fileUrl);

        if (!tgResponse.ok) {
            throw new Error(`Ошибка скачивания из Telegram! ${tgResponse.statusText}`);
        }

        const pdfBuffer = await tgResponse.arrayBuffer();

        return await postPdf(pdfBuffer);
    });

    let text: string = isReceived ? "Новое расписание успешно отправлено!" : "Не удалось отправить новое расписание";

    await ctx.reply(text, { reply_markup: await mainKeyboard(user) });

    await con.halt();
}

export async function getStudentSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));

    let tomorrow: Date | null = await getDateInDialog(con, ctx);

    await setSuggestionsKeyboardInDialog(ctx, con, "GROUP", user);
    
    const { name: groupName } = await getNameInDialog(ctx, con, user);

    const subgroup: Subgroup = await getSubgroupInDialog(ctx, con);

    const schedule: string = await getScheduleForDialog(con, "GROUP", groupName, subgroup, tomorrow);

    await ctx.reply(schedule, { reply_markup: await mainKeyboard(user) });
    
    await con.halt();
}

export async function getTeacherSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));

    let tomorrow: Date | null = await getDateInDialog(con, ctx);

    await setSuggestionsKeyboardInDialog(ctx, con, "TEACHER", user);

    const { name: teacherName } = await getNameInDialog(ctx, con, user);

    const schedule: string = await getScheduleForDialog(con, "TEACHER", teacherName, Subgroup.BOTH, tomorrow);

    await ctx.reply(schedule, { reply_markup: await mainKeyboard(user) });

    await con.halt();
}