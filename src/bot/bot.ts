import { Bot } from "grammy";
import { Schedule } from "../lesson/types";
import { ApiCommunicator } from "../api";
import { prettifySchedule } from "../lesson/helper";
import {conversations, createConversation} from "@grammyjs/conversations";
import {
    getStudentSchedule,
    getTeacherSchedule
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
    enterGetTeacherScheduleConversation,
    enterSubscribeToScheduleConversation,
    enterUnsubscribeFromScheduleConversation
} from "./handlers/enterConversation";
import {handleSubscriptionManagement} from "./handlers/subscriptionManagment";
import {ScheduleSubscription} from "./database/types";

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

        this.bot.hears(BotButtons.STUDENT_SCHEDULE, enterGetStudentScheduleConversation);

        this.bot.hears(BotButtons.TEACHER_SCHEDULE, enterGetTeacherScheduleConversation);

        this.bot.hears(BotButtons.SUBSCRIBE, enterSubscribeToScheduleConversation)

        this.bot.hears(BotButtons.UNSUBSCRIBE, enterUnsubscribeFromScheduleConversation)

        this.bot.hears(BotButtons.SUBSCRIPTION_MANAGEMENT, handleSubscriptionManagement)

        this.bot.start().then(() => {
            console.log("Телеграм Бот Запущен!");
        })
        .catch((err) => {
            console.error(`Ошибка при запуске телеграм бота: ${err}`);
        });
    }

    public static async sendScheduleForSubscribed() {
        try {
            const data: ScheduleSubscription[] = await Database.getScheduleSubscriptions();
            for (const sub of data) {
                let schedule: Schedule;
                let scheduleFor: string = "";

                if (sub.group_name !== null) {
                    scheduleFor += `группы: ${sub.group_name.toLocaleUpperCase()}`;
                    schedule = await ApiCommunicator.getSchedule({ type: "student", name: sub.group_name, subgroup: sub.sub_group });
                } else if (sub.teacher_name !== null) {
                    scheduleFor += `преподавателя: ${sub.teacher_name}`;
                    schedule = await ApiCommunicator.getSchedule({ type: "teacher", name: sub.teacher_name });
                }

                const text = prettifySchedule(schedule!, scheduleFor);
                await this.bot.api.sendMessage(sub.chat_id, text);
            }
        }
        catch (err) {
            console.error(`Error occurred while fetching subscription data: ${err}`);
            throw new Error(`can't get subscription data`);
        }
    }
}