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

export async function getStudentSchedule(con: AkttBotConversation, ctx: AkttBotContext) {
    let tomorrow = await getDateInDialog(con, ctx);

    await setSuggestionsKeyboardInDialog(ctx, "group");
    
    const { name: groupName } = await getNameInDialog(ctx, con, tomorrow);

    const subgroup = await getSubgroupInDialog(ctx, con);

    const schedule: string = await getScheduleForDialog(con, "student", groupName.toLocaleUpperCase(), subgroup, tomorrow, `группы ${groupName}`)

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })
    
    await con.halt();
}

export async function getTeacherSchedule(con: AkttBotConversation, ctx: AkttBotContext) {
    let tomorrow = await getDateInDialog(con, ctx);

    await setSuggestionsKeyboardInDialog(ctx, "teacher");

    const { name: teacherName } = await getNameInDialog(ctx, con, tomorrow);

    const schedule: string = await getScheduleForDialog(con, "teacher", teacherName, Subgroup.BOTH, tomorrow, `преподавателя ${teacherName}`)

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })

    await con.halt();
}