import {HearsContext} from "grammy";
import {AkttBotContext, BotConversations} from "../constants";

export async function enterGetStudentScheduleConversation(ctx: HearsContext<AkttBotContext>): Promise<void> {
    await ctx.conversation.enter(BotConversations.GET_STUDENT_SCHEDULE)
}

export async function enterGetTeacherScheduleConversation(ctx: HearsContext<AkttBotContext>): Promise<void> {
    await ctx.conversation.enter(BotConversations.GET_TEACHER_SCHEDULE);
}

export async function enterSendPdfScheduleConversation(ctx: HearsContext<AkttBotContext>): Promise<void> {
    await ctx.conversation.enter(BotConversations.SEND_SCHEDULE);
}

export async function enterAnnounceConversation(ctx: HearsContext<AkttBotContext>): Promise<void> {
    await ctx.conversation.enter(BotConversations.ANNOUNCE);
}