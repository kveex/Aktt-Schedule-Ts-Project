import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Bot } from "grammy";
import { getScheduleSubscriptions } from "./database";
import { Lesson } from "../lesson/types";
import { ApiCommunicator } from "../api";
import { pretifySchedule } from "../lesson/helper";

export class AkttBot {
    private static _instance: AkttBot;
    private static bot: Bot;
    private static client: SupabaseClient;

    private constructor(token: string, supabase_url: string, supabase_key: string) {
        AkttBot.bot = new Bot(token);
        AkttBot.client = createClient(supabase_url, supabase_key);
    }

    public static initialize(token: string, supabase_url: string, supabase_key: string) {
        this._instance = new this(token, supabase_url, supabase_key);
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
        const data = await getScheduleSubscriptions(this.client);

        if (!data) throw new Error("can't get subscription data");

        for (const sub of data) {
            let lessons: Lesson[] = [];
            let schedleFor: string = "";

            if (sub.group_name !== null) {
                schedleFor += `группы: ${sub.group_name}`
                lessons = await ApiCommunicator.getStudentSchedule(scheduleDate, sub.group_name, sub.subgroup);
            } else if (sub.teacher_name !== null) {
                schedleFor += `преподавателя: ${sub.teacher_name}`
                lessons = await ApiCommunicator.getTeacherSchedule(scheduleDate, sub.teacher_name);
            }

            const text = pretifySchedule(scheduleDate, lessons, schedleFor)

            await this.bot.api.sendMessage(sub.chat_id, text);
        }
    }
}