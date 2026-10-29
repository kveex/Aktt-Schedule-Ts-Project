import {HearsContext} from "grammy";
import {AkttBotContext, BotConversations} from "../constants";

export async function enterGetStudentScheduleConversation(ctx: HearsContext<AkttBotContext>): Promise<void> {
    await ctx.conversation.enter(BotConversations.GET_STUDENT_SCHEDULE)
}

export async function enterGetTeacherScheduleConversation(ctx: HearsContext<AkttBotContext>) {
    await ctx.conversation.enter(BotConversations.GET_TEACHER_SCHEDULE);
}

export async function enterSubscribeToScheduleConversation(ctx: HearsContext<AkttBotContext>): Promise<void> {
    await ctx.conversation.enter(BotConversations.SUBSCRIBE_TO_SCHEDULE);
}

export async function enterUnsubscribeFromScheduleConversation(ctx: HearsContext<AkttBotContext>) {
    await ctx.conversation.enter(BotConversations.UNSUBSCRIBE_FROM_SCHEDULE);
}