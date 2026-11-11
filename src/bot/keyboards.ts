import { InlineKeyboard, Keyboard } from "grammy";
import {ScheduleTarget, Subgroup} from "../lesson/types";
import { subgroupToString } from "../lesson/helper";
import {BotButtons} from "./constants";
import {getKeyboardSuggestions} from "./database/keyboard_suggestions";
import {KeyboardSuggestion, ScheduleSubscription, User} from "./database/types";
import {getUser} from "./database/users";
import {subscriptionLabel} from "../util/helper";

export async function mainKeyboardById(chatId: number): Promise<Keyboard> {
    const user: User = await getUser(chatId);
    return mainKeyboard(user);
}

export async function mainKeyboard(user: User): Promise<Keyboard> {
    const startKeyboardLabels: BotButtons[] = [
            BotButtons.STUDENT_SCHEDULE,
            BotButtons.TEACHER_SCHEDULE,
            BotButtons.SUBSCRIPTION_MANAGEMENT
    ];

    const actions = [];

    if (user.user_actions.includes("SCHEDULE_SENDER")) {
        actions.push(Keyboard.text(BotButtons.SEND_SCHEDULE));
    }

    if (user.user_actions.includes("MESSENGER")) {
        actions.push(Keyboard.text(BotButtons.SEND_MESSAGE));
    }

    const buttonRows = startKeyboardLabels
    .map((label) => [Keyboard.text(label)]);
    buttonRows.push(actions);

    return Keyboard.from(buttonRows).resized().persistent();
}

export const subgroupsKeyboardLabels = [
        subgroupToString(Subgroup.FIRST),
        subgroupToString(Subgroup.SECOND),
        subgroupToString(Subgroup.BOTH),
        BotButtons.CANCEL
    ];

export function subgroupsKeyboard(): Keyboard {
    const buttonRows = subgroupsKeyboardLabels
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export const datePickKeyboardButtons = [
    BotButtons.NEWEST_SCHEDULE,
    BotButtons.CUSTOM_DATE_SCHEDULE,
    BotButtons.CANCEL
]

export function datePickKeyboard(): Keyboard {
    const buttonRows = datePickKeyboardButtons
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export function subscriptionManagementKeyboard(subscriptions: ScheduleSubscription[]): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    for (const sub of subscriptions) {
        keyboard.text(subscriptionLabel(sub), `sub:card:${sub.id}`).row();
    }

    keyboard.text("Добавить подписку", "sub:add");

    return keyboard;
}

export function subscriptionCardKeyboard(id: number): InlineKeyboard {
    return new InlineKeyboard()
        .text("Удалить", `sub:del:${id}`)
        .text("Назад", "sub:list");
}

export function subscriptionConfirmKeyboard(id: number): InlineKeyboard {
    return new InlineKeyboard()
        .text("Да, удалить", `sub:confirm:${id}`)
        .text("Отмена", `sub:card:${id}`);
}

export function cancelKeyboard(): Keyboard {
    return Keyboard.from([[Keyboard.text(BotButtons.CANCEL)]]).resized().persistent();
}

export async function makeSuggestionsKeyboard(user: User, target: ScheduleTarget): Promise<Keyboard | null> {
    const suggestions: KeyboardSuggestion[] = await getKeyboardSuggestions(user, target);

    if (!suggestions || suggestions.length === 0) return null;
    
    const buttonRows = (suggestions)
    .map((suggestion) => [Keyboard.text(suggestion.value)]);

    return Keyboard.from(buttonRows).row().add(Keyboard.text(BotButtons.CANCEL)).resized().persistent();
}

export function announcementKeyboard(): Keyboard {
    return Keyboard.from([[Keyboard.text(BotButtons.SEND)], [Keyboard.text(BotButtons.CANCEL)]]).resized().persistent();
}