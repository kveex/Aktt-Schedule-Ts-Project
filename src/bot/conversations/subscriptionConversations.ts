import {Subgroup} from "../../lesson/types";
import {getNameInDialog, getSubgroupInDialog, setSuggestionsKeyboardInDialog} from "./helper";
import {mainKeyboard} from "../keyboards";
import {AkttBotContext, AkttBotConversation} from "../constants";
import {createScheduleSubscription} from "../database/schedule_subscriptions";
import {User} from "../database/types";
import {getUser} from "../database/users";
import {sendSubscriptionManagement} from "../handlers/subscriptionManagment";

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
    await sendSubscriptionManagement(ctx);
}