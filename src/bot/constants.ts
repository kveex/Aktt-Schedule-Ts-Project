import {Conversation, ConversationFlavor} from "@grammyjs/conversations";
import {Context} from "grammy";
import {sendPdfSchedule} from "./conversations/scheduleConversations";

export type AkttBotContext = ConversationFlavor<Context>;
export type AkttBotConversation = Conversation<AkttBotContext, AkttBotContext>

export const BotButtons = {
    STUDENT_SCHEDULE: "Расписание для группы",
    TEACHER_SCHEDULE: "Расписание для преподавателя",
    SEND_SCHEDULE: "Загрузить расписание",
    SUBSCRIPTION_MANAGEMENT: "Управление подписками",
    SUBSCRIBE: "Подписка на расписание",
    UNSUBSCRIBE: "Отписка от расписания",
    NEWEST_SCHEDULE: "Самое свежее расписание",
    CUSTOM_DATE_SCHEDULE: "Указать конкретную дату",
    CANCEL: "Отмена"
} as const;

export type BotButtons = typeof BotButtons[keyof typeof BotButtons];

export const BotCommands = {
    START: "start",
}

export const BotConversations = {
    GET_STUDENT_SCHEDULE: "getStudentSchedule",
    GET_TEACHER_SCHEDULE: "getTeacherSchedule",
    SEND_SCHEDULE: "sendPdfSchedule",
    SUBSCRIBE_TO_SCHEDULE: "subscribeToSchedule",
    UNSUBSCRIBE_FROM_SCHEDULE: "unsubscribeFromSchedule",
}