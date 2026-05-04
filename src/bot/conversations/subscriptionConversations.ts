import type {Conversation} from "@grammyjs/conversations";
import {Context, Keyboard} from "grammy";
import {Subgroup} from "../../lesson/types";
import {getNameInDialog, getSubgroupInDialog, setSuggestionsKeyboardInDialog} from "./helper";
import {Database} from "../database";
import {mainKeyboard} from "../keyboards";
import {BotButtons} from "../constants";

export async function subscribeToSchedule(con: Conversation, ctx: Context) {
    let subgroup: Subgroup = Subgroup.BOTH;
    await setSuggestionsKeyboardInDialog(
        ctx,
        "group",
        "Введите название группы или фамилию и инициалы преподавателя [23-14ИС|Фамилия И.О.]:"
    );

    const { name, type } = await getNameInDialog(ctx, con, null);

    if (type === "group") {
        subgroup = await getSubgroupInDialog(ctx, con);
    }

    const errorMessage: string | null = await con.external(async () => {
        try {
            await Database.createUserSubscription(
                ctx.chatId!,
                type === "group" ? name : null,
                type === "teacher" ? name : null,
                subgroup
            );
            return null;
        } catch (error) {
            return error instanceof Error ? error.message : "Не удалось создать подписку";
        }
    });

    if (errorMessage) {
        await ctx.reply(errorMessage, { reply_markup: mainKeyboard() });
        return;
    }

    await ctx.reply("Подписка успешно создана!", { reply_markup: mainKeyboard() });
}

export async function unsubscribeFromSchedule(con: Conversation, ctx: Context) {
    let subscriptionsIds: string[] = [];
    const { subscriptions, count } = await con.external(async () => {
        return await Database.getUserSubscriptions(ctx.chatId!);
    });

    for (let i = 0; i < count; i++) {
        subscriptionsIds.push(`${i + 1}`);
    }

    let subscriptionIdsKeyboard: Keyboard = new Keyboard();
    for (const id of subscriptionsIds) {
        subscriptionIdsKeyboard.text(id);
    }
    subscriptionIdsKeyboard.row().text(BotButtons.CANCEL).resized().persistent();

    await ctx.reply("Укажите номер подписки, которую хотитее убрать:", { reply_markup: subscriptionIdsKeyboard });

    const { message: subscriptionArrayId } = await con.waitForHears(subscriptionsIds);

    const errorMessage: string | null = await con.external(async () => {
        try {
            await Database.removeUserSubscription(subscriptions.at(Number(subscriptionArrayId?.text!) - 1)?.id!);
            return null;
        } catch (error) {
            return error instanceof Error ? error.message : "Не удалось удалить подписку";
        }
    })

    if (errorMessage) {
        await ctx.reply(errorMessage, { reply_markup: mainKeyboard() });
        return;
    }

    await ctx.reply("Подписка успешно удалена!", { reply_markup: mainKeyboard() });
}