import { Context } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { mainKeyboard, subgroupsKeyboard, subgroupsKeyboardLabels } from "../keyboards";
import { stringToSubgroup } from "../../lesson/helper";
import {
    getDateInDialog,
    getListInDialog,
    getNameInDialog,
    getScheduleForDialog,
    setSuggestionsKeyboardInDialog
} from "./helper";
import {Subgroup} from "../../lesson/types";

export async function getStudentSchedule(con: Conversation, ctx: Context) {
    let tomorrow = await getDateInDialog(con, ctx);

    const { list, error } = await con.external(async () => {
        return await getListInDialog("groups", tomorrow);
    });

    if (error) {
        await ctx.reply(error);
        tomorrow = null;
    }

    await setSuggestionsKeyboardInDialog(ctx, "group");
    
    const groupName: string = await getNameInDialog(ctx, con, list, "group");
    
    await ctx.reply("Выбери подгруппу, для которой нужно расписание:", { reply_markup: subgroupsKeyboard() });

    const { message: subgroupMessage } = await con.waitForHears(subgroupsKeyboardLabels);

    const subgroup = stringToSubgroup(subgroupMessage?.text!)!;

    const schedule: string = await getScheduleForDialog(con, "student", groupName, subgroup, tomorrow, `группы ${groupName}`)

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })
    
    await con.halt();
}

export async function getTeacherSchedule(con: Conversation, ctx: Context) {
    let tomorrow = await getDateInDialog(con, ctx);

    const { list, error } = await con.external(async () => {
        return await getListInDialog("teachers", tomorrow);
    });

    if (error) {
        await ctx.reply(error);
        tomorrow = null;
    }

    await setSuggestionsKeyboardInDialog(ctx, "teacher");

    const teacherName: string = await getNameInDialog(ctx, con, list, "teacher");

    const schedule: string = await getScheduleForDialog(con, "teacher", teacherName, Subgroup.BOTH, tomorrow, `преподавателя ${teacherName}`)

    await ctx.reply(schedule, { reply_markup: mainKeyboard() })

    await con.halt();
}