import {Keyboard} from "grammy";
import {Subgroup} from "../../lesson/types";
import {getNameInDialog, getSubgroupInDialog, setSuggestionsKeyboardInDialog} from "./helper";
import {mainKeyboard} from "../keyboards";
import {AkttBotContext, AkttBotConversation, BotButtons} from "../constants";
import {
    createScheduleSubscription,
    getUserSubscriptions,
    removeUserSubscription
} from "../database/schedule_subscriptions";
import {User} from "../database/types";
import {getUser} from "../database/users";

export async function subscribeToSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));
    let subgroup: Subgroup = Subgroup.BOTH;
    await setSuggestionsKeyboardInDialog(
        ctx,
        con,
        "GROUP",
        user,
        "Введите название группы или фамилию и инициалы преподавателя [23-14ИС|Фамилия И.О.]:"
    );

    const { name, target } = await getNameInDialog(ctx, con, user);

    if (target === "GROUP") {
        subgroup = await getSubgroupInDialog(ctx, con);
    }

    const errorMessage: string | null = await con.external(async () => {
        const user: User = await getUser(ctx.chatId!);
        try {
            await createScheduleSubscription(user, target, name, subgroup);
            return null;
        } catch (error) {
            return error instanceof Error ? error.message : "Не удалось создать подписку!";
        }
    });

    if (errorMessage) {
        await ctx.reply(errorMessage, { reply_markup: await mainKeyboard(user) });
        return;
    }

    await ctx.reply("Подписка успешно создана!", { reply_markup: await mainKeyboard(user) });
}

export async function unsubscribeFromSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));
    let subscriptionsIds: string[] = [];
    const { subscriptions, count } = await con.external(async () => {
        return await getUserSubscriptions(user);
    });

    for (let i = 0; i < count; i++) {
        subscriptionsIds.push(`${i + 1}`);
    }

    let subscriptionIdsKeyboard: Keyboard = new Keyboard();
    for (const id of subscriptionsIds) {
        subscriptionIdsKeyboard.text(id);
    }
    subscriptionIdsKeyboard.row().text(BotButtons.CANCEL).resized().persistent();

    await ctx.reply("Укажите номер подписки, которую хотите убрать:", { reply_markup: subscriptionIdsKeyboard });

    const { message: subscriptionArrayId } = await con.waitForHears(subscriptionsIds);

    const errorMessage: string | null = await con.external(async () => {
        try {
            await removeUserSubscription(subscriptions.at(Number(subscriptionArrayId?.text!) - 1)!);
            return null;
        } catch (error) {
            return error instanceof Error ? error.message : "Не удалось удалить подписку";
        }
    })

    if (errorMessage) {
        await ctx.reply(errorMessage, { reply_markup: await mainKeyboard(user) });
        return;
    }

    await ctx.reply("Подписка успешно удалена!", { reply_markup: await mainKeyboard(user) });
}