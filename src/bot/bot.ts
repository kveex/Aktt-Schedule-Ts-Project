import { Bot, Context } from "grammy";
import { Database, ScheduleSubscription } from "./database";
import { Schedule } from "../lesson/types";
import { ApiCommunicator } from "../api";
import { pretifySchedule } from "../lesson/helper";
import { mainKeyboard } from "./keyboards";
import { ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { getStudentSchedule, getTeacherSchedule } from "./conversations/functions";
import { BotButtons } from "./constants";

export class AkttBot {
    private static _instance: AkttBot;
    private static bot: Bot<ConversationFlavor<Context>>;

    private constructor(token: string) {
        AkttBot.bot = new Bot<ConversationFlavor<Context>>(token);
    }

    public static initialize(token: string) {
        this._instance = new this(token);
        this.bot.use(conversations());

        this.bot.command("start", async (ctx) => {
            await ctx.reply("Здраствуйте!", {reply_markup: mainKeyboard()});
        })

        this.bot.use(createConversation(getStudentSchedule));
        this.bot.use(createConversation(getTeacherSchedule))


        this.bot.hears(BotButtons.STUDENT_SCHEDULE, async (ctx) =>{
            await ctx.conversation.enter("getStudentSchedule");
        })
        this.bot.hears(BotButtons.TEACHER_SCHEDULE, async (ctx) =>{
            await ctx.conversation.enter('getTeacherSchedule')
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
        try {
            const data: ScheduleSubscription[] = await Database.getScheduleSubscriptions();
            for (const sub of data) {
                let schedule: Schedule;
                let scheduleFor: string = "";

                if (sub.group_name !== null) {
                    scheduleFor += `группы: ${sub.group_name}`;
                    schedule = await ApiCommunicator.getSchedule({ type: "student", name: sub.group_name, scheduleDate: scheduleDate, subgroup: sub.sub_group });
                } else if (sub.teacher_name !== null) {
                    scheduleFor += `преподавателя: ${sub.teacher_name}`
                    schedule = await ApiCommunicator.getSchedule({ type: "teacher", name: sub.teacher_name, scheduleDate: scheduleDate });
                }

                const text = pretifySchedule(schedule!, scheduleFor)
                await this.bot.api.sendMessage(sub.chat_id, text);
            }
        }
        catch (err) {
            console.error(`Error occurred while fetching subscription data: ${err}`);
            throw new Error(`can't get subscription data`)
        }
    }
}