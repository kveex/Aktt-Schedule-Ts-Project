import { Bot } from "grammy";
import { Schedule } from "../lesson/types";
import { prettifySchedule } from "../lesson/helper";
import {conversations, createConversation} from "@grammyjs/conversations";
import {
    getStudentSchedule,
    getTeacherSchedule, sendPdfSchedule
} from "./conversations/scheduleConversations";
import {AkttBotContext, BotButtons, BotCommands} from "./constants";
import {
    subscribeToSchedule,
    unsubscribeFromSchedule
} from "./conversations/subscriptionConversations";
import {handleStart} from "./handlers/start";
import {handleCancelConversation} from "./handlers/cancelConversation";
import {
    enterGetStudentScheduleConversation,
    enterGetTeacherScheduleConversation, enterSendPdfScheduleConversation,
    enterSubscribeToScheduleConversation,
    enterUnsubscribeFromScheduleConversation
} from "./handlers/enterConversation";
import {handleSubscriptionManagement} from "./handlers/subscriptionManagment";
import {ScheduleSubscription} from "./database/types";
import {getScheduleSubscriptions} from "./database/schedule_subscriptions";
import {getSchedule} from "../api/schedule";

export class AkttBot {
    private static bot: Bot<AkttBotContext>;

    private constructor(token: string) {
        AkttBot.bot = new Bot<AkttBotContext>(token);
    }

    public static initialize(token: string) {
        new this(token);
        this.bot.use(conversations());

        this.bot.command(BotCommands.START, handleStart)
        this.bot.use(handleCancelConversation);

        this.bot.use(createConversation(getStudentSchedule));
        this.bot.use(createConversation(getTeacherSchedule));
        this.bot.use(createConversation(subscribeToSchedule));
        this.bot.use(createConversation(unsubscribeFromSchedule));
        this.bot.use(createConversation(sendPdfSchedule))

        this.bot.hears(BotButtons.STUDENT_SCHEDULE, enterGetStudentScheduleConversation);

        this.bot.hears(BotButtons.TEACHER_SCHEDULE, enterGetTeacherScheduleConversation);

        this.bot.hears(BotButtons.SEND_SCHEDULE, enterSendPdfScheduleConversation);

        this.bot.hears(BotButtons.SUBSCRIBE, enterSubscribeToScheduleConversation);

        this.bot.hears(BotButtons.UNSUBSCRIBE, enterUnsubscribeFromScheduleConversation);

        this.bot.hears(BotButtons.SUBSCRIPTION_MANAGEMENT, handleSubscriptionManagement);

        this.bot.start().then(() => {
            console.log("Телеграм Бот Запущен!");
        })
        .catch((err) => {
            console.error(`Ошибка при запуске телеграм бота: ${err}`);
        });

        this.bot.catch(error => {
            console.error(`Неизвестная ошибка: ${error.message}`);
        })
    }

    public static async sendScheduleForSubscribed() {
        try {
            const data: ScheduleSubscription[] = await getScheduleSubscriptions();
            for (const sub of data) {
                const schedule: Schedule = await getSchedule(sub);

                const text: string = prettifySchedule(schedule!, sub.target, sub.value);
                await this.bot.api.sendMessage(sub.user.chat_id, text);
            }
        } catch (err) {
            console.error(`Error occurred while fetching subscription data: ${err}`);
            throw new Error(`can't get subscription data`);
        }
    }
}