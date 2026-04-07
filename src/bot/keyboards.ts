import { Keyboard } from "grammy";
import { BotButtons } from "./bot";
import { Subgroup } from "../lesson/types";
import { subgroupToString } from "../lesson/helper";

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
        subgroupToString(Subgroup.BOTH)
    ];

export function subgroupsKeyboard() {
    const buttonRows = subgroupsKeyboardLabels
    .map((label) => [Keyboard.text(label)]);

    return Keyboard.from(buttonRows).resized().persistent();
}