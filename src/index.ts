import 'dotenv/config'
import {Bot} from "grammy";
import {createClient} from "@supabase/supabase-js";
import {getScheduleSubscription} from "./database";
import serverStart from './server';
import { ApiCommunicator, pretifySchedule, Schedule} from './api';

if(process.env.API_ADDRESS === undefined) throw new Error()
if(process.env.SERVER_ADDRESS === undefined) throw new Error()
if (process.env.SUPABASE_KEY === undefined || process.env.SUPABASE_KEY === '') throw new Error("Supabase KEY is required");
if (process.env.SUPABASE_URL === undefined || process.env.SUPABASE_URL === '') throw new Error("Supabase URL is required");
if (process.env.BOT_TOKEN === undefined || process.env.BOT_TOKEN === '') throw new Error("Bot token is required");

serverStart(process.env.API_ADDRESS, process.env.SERVER_ADDRESS)

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const supabase = createClient(url, key)

ApiCommunicator.initialise(process.env.API_ADDRESS)

const bot_token: string = process.env.BOT_TOKEN;
const bot = new Bot(bot_token);

export async function sendSchedule() {
    const data = await getScheduleSubscription(supabase)
    const months: string[] = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ]

    if (!data) throw new Error("can't get subscription data");

    for (const info of data) {
        const d = new Date(2026, 3, 7);
        let lessons: Schedule[] = [];
        let text = `Расписание на ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}:\n\n`;

        if (info.group_name !== null) {
            lessons = await ApiCommunicator.getStudentSchedule(d, info.group_name, info.subgroup)
        } else if (info.teacher_name !== null) {
            lessons = await ApiCommunicator.getTeacherSchedule(d, info.teacher_name)
        }

        for (const lesson of lessons) {
            text += pretifySchedule(lesson)
        }

        await bot.api.sendMessage(info.chat_id, text);
    }
}

bot.on("message", (ctx) => ctx.reply("Got another message!"));
bot.start();
