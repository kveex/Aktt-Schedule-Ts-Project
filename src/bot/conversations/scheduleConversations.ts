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
import {PdfPostResult} from "../../api/types";
import {parseDate} from "../../util/helper";
import {DateInDialog} from "./types";
import {telegramFetch, telegramFileUrl} from "../telegram";

export async function sendPdfSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));

    if (!user.user_actions.includes("SCHEDULE_SENDER")) {
        await ctx.reply("У вас недостаточно прав для данного действия!", { reply_markup: await mainKeyboard(user) });
        await con.halt();
    }

    await ctx.reply("Отправьте PDF файл с расписанием:", { reply_markup: cancelKeyboard() });

    let document;
    let manualDate: Date | undefined = undefined;

    while (true) {
        const { message } = await con.waitFor(":document");
        document = message!.document;

        if (document?.mime_type === "application/pdf") {
            break;
        }

        await ctx.reply("Отправлен не PDF файл!");
    }

    while (true) {
        let response: PdfPostResult = await con.external(async () => {
            const file = await ctx.api.getFile(document.file_id);

            if (!file.file_path) {
                throw new Error("Telegram не вернул путь к файлу");
            }

            const fileUrl = telegramFileUrl(file.file_path);
            const tgResponse = await telegramFetch()(fileUrl);

            if (!tgResponse.ok) {
                throw new Error(`Ошибка скачивания из Telegram! ${tgResponse.statusText}`);
            }

            const pdfBuffer = await tgResponse.arrayBuffer();

            return await postPdf(pdfBuffer, manualDate);
        });

        let text: string;

        if (response == PdfPostResult.UNRECOGNISABLE_DATE) {
            await ctx.reply(
                "Дата, на которое рассчитано расписание, не получилось выявить. Напиши дату в формате гггг-мм-дд в чат:",
                { reply_markup: cancelKeyboard() }
            );

            while (true) {
                const { message: customDate } = await con.waitFor("message:text");
                const input: string = customDate.text.toLocaleLowerCase();
                try {
                    manualDate = await con.external(() => {
                        return parseDate(input);
                    });
                    break;
                } catch {
                    await ctx.reply(
                        "Дата указана не по формату или оказалась нереалистичной, попробуй снова:",
                        { reply_markup: cancelKeyboard() }
                    )
                }
            }
            continue;
        }

        switch (response) {
            case PdfPostResult.ALREADY_EXISTS: {
                text = "Это расписание уже добавлено в систему :)";
                break;
            }
            case PdfPostResult.EMPTY_PDF: {
                text = "Пдф оказался пустым!";
                break;
            }
            case PdfPostResult.SUCCESS: {
                text = "Расписание успешно отправлено :)";
                break;
            }
            case PdfPostResult.TIMEOUT: {
                text = "Не получилось обратиться к API, попробуйте снова позже";
                break;
            }
            default: {
                text = "Не удалось отправить расписание!";
                break;
            }
        }

        await ctx.reply(text, { reply_markup: await mainKeyboard(user) });

        await con.halt();
        break;
    }
}

export async function getStudentSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    let tomorrow: DateInDialog = await getDateInDialog(con, ctx);

    const user: User = await con.external(async () => await getUser(tomorrow.chatId));

    await setSuggestionsKeyboardInDialog(ctx, con, "GROUP", user);
    
    const { name: groupName } = await getNameInDialog(ctx, con, user);

    const subgroup: Subgroup = await getSubgroupInDialog(ctx, con);

    const schedule: string = await getScheduleForDialog(con, "GROUP", groupName, subgroup, tomorrow.date);

    await ctx.reply(schedule, { reply_markup: await mainKeyboard(user) });
    
    await con.halt();
}

export async function getTeacherSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    let tomorrow: DateInDialog = await getDateInDialog(con, ctx);

    const user: User = await con.external(async () => await getUser(tomorrow.chatId));

    await setSuggestionsKeyboardInDialog(ctx, con, "TEACHER", user);

    const { name: teacherName } = await getNameInDialog(ctx, con, user);

    const schedule: string = await getScheduleForDialog(con, "TEACHER", teacherName, Subgroup.BOTH, tomorrow.date);

    await ctx.reply(schedule, { reply_markup: await mainKeyboard(user) });

    await con.halt();
}