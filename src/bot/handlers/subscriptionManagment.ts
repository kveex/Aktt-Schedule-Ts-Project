import {CallbackQueryContext, InlineKeyboard} from "grammy";
import {AkttBotContext, BotConversations} from "../constants";
import {ScheduleSubscription, User} from "../database/types";
import {getUser} from "../database/users";
import {getUserSubscriptions, removeUserSubscription} from "../database/schedule_subscriptions";
import {
    subscriptionCardText,
    subscriptionConfirmText,
    subscriptionsToString
} from "../../util/helper";
import {
    subscriptionCardKeyboard,
    subscriptionConfirmKeyboard,
    subscriptionManagementKeyboard
} from "../keyboards";

async function getSubscriptions(user: User): Promise<ScheduleSubscription[]> {
    const { subscriptions } = await getUserSubscriptions(user);
    return subscriptions;
}

async function findSubscription(user: User, id: number | undefined): Promise<ScheduleSubscription | undefined> {
    if (id === undefined) {
        return undefined;
    }

    const subscriptions = await getSubscriptions(user);
    return subscriptions.find((sub) => sub.id === id);
}

async function editOrReply(ctx: AkttBotContext, text: string, keyboard: InlineKeyboard): Promise<void> {
    try {
        await ctx.editMessageText(text, { reply_markup: keyboard });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!message.includes("not modified")) {
            await ctx.reply(text, { reply_markup: keyboard });
        }
    }
}

async function showManagement(ctx: AkttBotContext, user: User): Promise<void> {
    const subscriptions = await getSubscriptions(user);
    await editOrReply(ctx, subscriptionsToString(subscriptions), subscriptionManagementKeyboard(subscriptions));
}

export async function sendSubscriptionManagement(ctx: AkttBotContext): Promise<void> {
    const user: User = await getUser(ctx.chatId!);
    const subscriptions = await getSubscriptions(user);

    await ctx.reply(subscriptionsToString(subscriptions), {
        reply_markup: subscriptionManagementKeyboard(subscriptions)
    });
}

export async function handleSubscriptionManagement(ctx: AkttBotContext): Promise<void> {
    await sendSubscriptionManagement(ctx);
}

export async function handleSubscriptionCallback(ctx: CallbackQueryContext<AkttBotContext>): Promise<void> {
    const [, action, rawId] = ctx.callbackQuery.data.split(":");
    const id: number | undefined = rawId ? Number(rawId) : undefined;

    const user: User = await getUser(ctx.chatId!);

    switch (action) {
        case "add": {
            await ctx.answerCallbackQuery();

            try {
                await ctx.deleteMessage();
            } catch (error) {
                console.warn("Не удалось удалить сообщение меню подписок:", error);
            }

            await ctx.conversation.enter(BotConversations.SUBSCRIBE_TO_SCHEDULE);
            return;
        }
        case "list": {
            await showManagement(ctx, user);
            break;
        }
        case "card": {
            const subscription = await findSubscription(user, id);
            if (subscription) {
                await editOrReply(ctx, subscriptionCardText(subscription), subscriptionCardKeyboard(subscription.id));
            } else {
                await showManagement(ctx, user);
            }
            break;
        }
        case "del": {
            const subscription = await findSubscription(user, id);
            if (subscription) {
                await editOrReply(ctx, subscriptionConfirmText(subscription), subscriptionConfirmKeyboard(subscription.id));
            } else {
                await showManagement(ctx, user);
            }
            break;
        }
        case "confirm": {
            const subscription = await findSubscription(user, id);
            if (subscription) {
                await removeUserSubscription(subscription);
            }
            await showManagement(ctx, user);
            break;
        }
    }

    await ctx.answerCallbackQuery();
}
