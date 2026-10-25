import {HearsContext} from "grammy";
import {AkttBotContext} from "../constants";
import {User} from "../database/types";
import {getUser} from "../database/users";
import {getUserSubscriptions} from "../database/schedule_subscriptions";
import {subscriptionsToString} from "../../util/helper";
import {subscriptionActionKeyboard} from "../keyboards";

export async function handleSubscriptionManagement(ctx: HearsContext<AkttBotContext>): Promise<void> {
    const user: User = await getUser(ctx.chatId);
    const { subscriptions, count } = await getUserSubscriptions(user);

    const subscriptionsText: string = subscriptionsToString(subscriptions);
    await ctx.reply(subscriptionsText, { reply_markup: subscriptionActionKeyboard(count) });
}