import {
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

export async function getStudentSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));

    let tomorrow: Date | null = await getDateInDialog(con, ctx);

    await setSuggestionsKeyboardInDialog(ctx, con, "GROUP", user);
    
    const { name: groupName } = await getNameInDialog(ctx, con, user);

    const subgroup: Subgroup = await getSubgroupInDialog(ctx, con);

    const schedule: string = await getScheduleForDialog(con, "GROUP", groupName, subgroup, tomorrow);

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })
    
    await con.halt();
}

export async function getTeacherSchedule(con: AkttBotConversation, ctx: AkttBotContext): Promise<void> {
    const user: User = await con.external(async () => await getUser(ctx.chatId!));

    let tomorrow: Date | null = await getDateInDialog(con, ctx);

    await setSuggestionsKeyboardInDialog(ctx, con, "TEACHER", user);

    const { name: teacherName } = await getNameInDialog(ctx, con, user);

    const schedule: string = await getScheduleForDialog(con, "TEACHER", teacherName, Subgroup.BOTH, tomorrow)

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })

    await con.halt();
}