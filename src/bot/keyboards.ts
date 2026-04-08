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

export function cancelKeyboard() {
    return Keyboard.from([[Keyboard.text(BotButtons.CANCEL)]]).resized().persistent();
}

export async function keyboardSuggestionsKeyboard(chatId: number, type: "group" | "teacher") {
    const buttonRows = (await Database.getKeyboardSuggestions(chatId, type))
    .map((suggestion) => [Keyboard.text(suggestion.value)]);

    return Keyboard.from(buttonRows).resized().persistent();
}