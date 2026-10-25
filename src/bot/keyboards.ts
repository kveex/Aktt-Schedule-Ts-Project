import { Keyboard } from "grammy";
import { Subgroup } from "../lesson/types";
import { subgroupToString } from "../lesson/helper";
import { Database } from "./database";
import { BotButtons } from "./constants";

export function mainKeyboard() {
    const startKeyboardLabels = [
            BotButtons.STUDENT_SCHEDULE,
            BotButtons.TEACHER_SCHEDULE,
            BotButtons.SUBSCRIPTION_MANAGEMENT
    ];

    const buttonRows = startKeyboardLabels
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}

export const subgroupsKeyboardLabels = [
        subgroupToString(Subgroup.FIRST, "text"),
        subgroupToString(Subgroup.SECOND, "text"),
        subgroupToString(Subgroup.BOTH, "text"),
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

export async function keyboardSuggestionsKeyboard(chatId: number, type: "group" | "teacher"): Promise<Keyboard | null> {
    const suggestions = await Database.getKeyboardSuggestions(chatId, type);

    if (!suggestions || suggestions.length === 0) return null;
    
    const buttonRows = (suggestions)
    .map((suggestion) => [Keyboard.text(suggestion.value)]);

    return Keyboard.from(buttonRows).row().add(Keyboard.text(BotButtons.CANCEL)).resized().persistent();
}