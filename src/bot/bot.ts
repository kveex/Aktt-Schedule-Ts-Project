import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Bot, Context } from "grammy";
import { getScheduleSubscriptions } from "./database";
import { Lesson } from "../lesson/types";
import { ApiCommunicator } from "../api";
import { pretifySchedule } from "../lesson/helper";
import { mainKeyboard } from "./keyboards";
import { ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { getStudentSchedule } from "./conversations/functions";


export const BotButtons = {
    STUDENT_SCHEDULE: "Расписание для группы",
    TEACHER_SCHEDULE: "Расписание для преподавателя",
    SUBSCRIPTION_MANAGEMENT: "Управление подписками",
    SUBSCRIBE: "Подписка на расписание",
    UNSUBSCRIBE: "Отписка от расписания"
} as const;

export class AkttBot {
    private static _instance: AkttBot;
    private static bot: Bot<ConversationFlavor<Context>>;
    private static client: SupabaseClient;

    private constructor(token: string, supabase_url: string, supabase_key: string) {
        AkttBot.bot = new Bot<ConversationFlavor<Context>>(token);
        AkttBot.client = createClient(supabase_url, supabase_key);
    }

    public static initialize(token: string, supabase_url: string, supabase_key: string) {
        this._instance = new this(token, supabase_url, supabase_key);
        this.bot.use(conversations());

        this.bot.command("start", async (ctx) => {
            await ctx.reply("pepeni", {reply_markup: mainKeyboard()});
        })

        this.bot.use(createConversation(getStudentSchedule));

        this.bot.hears(BotButtons.SUBSCRIPTION_MANAGEMENT, async (ctx) => {
            ctx.reply("hui")
        })
  
        this.bot.hears(BotButtons.STUDENT_SCHEDULE, async (ctx) =>{
            // await ctx.reply('Напишите название группы', {reply_markup: {remove_keyboard: true}})
            await ctx.conversation.enter("getStudentSchedule");
        })

        this.bot.start().then(() => {
            console.log("Телеграм Бот Запущен!");
        })
        .catch((err) => {
            console.error(`Ошибка при запуске телеграм бота: ${err}`);
        });
    }

    public static get Instance() {
        return this._instance;
    }

    public static async sendScheduleForSubscribed(scheduleDate: Date) {
        try{
            const data = await getScheduleSubscriptions(this.client);
            for (const sub of data) {
                let lessons: Lesson[] = [];
                let scheduleFor: string = "";
                if (sub.groupName !== null) {
                    scheduleFor += `группы: ${sub.groupName}`
                    lessons = await ApiCommunicator.getStudentSchedule(scheduleDate, sub.groupName, sub.subgroup);
                } else if (sub.teacherName !== null) {
                    scheduleFor += `преподавателя: ${sub.teacherName}`
                    lessons = await ApiCommunicator.getTeacherSchedule(scheduleDate, sub.teacherName);
                }
                const text = pretifySchedule(scheduleDate, lessons, scheduleFor)
                await this.bot.api.sendMessage(sub.chatId, text);
            }

        }
        catch{
            throw new Error(`can't get subscription data`)
        }
    }
}