import {ScheduleTarget, Subgroup} from "../../lesson/types";

const Action = {
    SCHEDULE_SENDER: "SCHEDULE_SENDER",
    MESSENGER: "MESSENGER"
} as const;

export type Action = typeof Action[keyof typeof Action];

export interface User {
    id: number;
    chat_id: number;
    user_actions: Action[];
}

export interface RawUser {
    id: number;
    chat_id: number;
    users_actions: { action: string }[];
}

export interface KeyboardSuggestion {
    id: number;
    user: User;
    target: ScheduleTarget;
    value: string;
    created_at: string;
}

export interface ScheduleSubscription {
    id: number;
    user: User;
    target: ScheduleTarget;
    value: string;
    subgroup: Subgroup;
}