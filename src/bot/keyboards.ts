import { Keyboard } from "grammy";
import {ScheduleTarget, Subgroup} from "../lesson/types";
import { subgroupToString } from "../lesson/helper";
import {BotButtons} from "./constants";
import {getKeyboardSuggestions} from "./database/keyboard_suggestions";
import {KeyboardSuggestion, User} from "./database/types";
import {getUser} from "./database/users";

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

    if (user.user_actions.includes("SCHEDULE_SENDER")) {
        startKeyboardLabels.push(BotButtons.SEND_SCHEDULE);
    }

    const buttonRows = startKeyboardLabels
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export const subgroupsKeyboardLabels = [
        subgroupToString(Subgroup.FIRST),
        subgroupToString(Subgroup.SECOND),
        subgroupToString(Subgroup.BOTH),
        BotButtons.CANCEL
    ];

export function subgroupsKeyboard() {
    const buttonRows = subgroupsKeyboardLabels
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export const datePickKeyboardButtons = [
    BotButtons.NEWEST_SCHEDULE,
    BotButtons.CUSTOM_DATE_SCHEDULE,
    BotButtons.CANCEL
]

export function datePickKeyboard() {
    const buttonRows = datePickKeyboardButtons
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export function subscriptionActionKeyboard(subscriptionCount: number) {
    const minSubscriptionsAmount: number = 1;
    const maxSubscriptionsAmount: number = 5;

    const subscriptionActionKeyboardButtons = [];
    if (subscriptionCount <= maxSubscriptionsAmount) subscriptionActionKeyboardButtons.push(BotButtons.SUBSCRIBE);
    if (subscriptionCount >= minSubscriptionsAmount) subscriptionActionKeyboardButtons.push(BotButtons.UNSUBSCRIBE);
    subscriptionActionKeyboardButtons.push(BotButtons.CANCEL);

    const buttonRows = subscriptionActionKeyboardButtons
        .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export function cancelKeyboard() {
    return Keyboard.from([[Keyboard.text(BotButtons.CANCEL)]]).resized().persistent();
}

export async function makeSuggestionsKeyboard(user: User, target: ScheduleTarget): Promise<Keyboard | null> {
    const suggestions: KeyboardSuggestion[] = await getKeyboardSuggestions(user, target);

    if (!suggestions || suggestions.length === 0) return null;
    
    const buttonRows = (suggestions)
    .map((suggestion) => [Keyboard.text(suggestion.value)]);

    return Keyboard.from(buttonRows).row().add(Keyboard.text(BotButtons.CANCEL)).resized().persistent();
}