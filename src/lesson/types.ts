export const TimeSlot = {
    FIRST: "FIRST",
    FIRST_SHORT: "FIRST_SHORT",
    SECOND: "SECOND",
    SECOND_FULL: "SECOND_FULL",
    SECOND_SHORT: "SECOND_SHORT",
    THIRD: "THIRD",
    THIRD_SHORT: "THIRD_SHORT",
    FOURTH: "FOURTH",
    FOURTH_SHORT: "FOURTH_SHORT",
    PRODUCTION_PRACTICE: "PRODUCTION_PRACTICE",
    LEARNING_PRACTICE: "LEARNING_PRACTICE",
    PRE_DIPLOMA_PRACTICE: "PRE_DIPLOMA_PRACTICE",
    CUSTOM: "CUSTOM",
} as const;

export type TimeSlot = typeof TimeSlot[keyof typeof TimeSlot];

const ScheduleTarget = {
    GROUP: "GROUP",
    TEACHER: "TEACHER"
} as const;

export type ScheduleTarget = typeof ScheduleTarget[keyof typeof ScheduleTarget];

export const Subgroup = {
    FIRST: "FIRST",
    SECOND: "SECOND",
    BOTH: "BOTH",
} as const;

export type Subgroup = typeof Subgroup[keyof typeof Subgroup];

export interface Lesson {
    groupName: string,
    teacherNames: string[],
    time: TimeSlot,
    subjectName: string,
    room: string,
    subGroup: Subgroup,
    state: string,
    customTime: string | null
}

export interface Schedule {
    scheduleDate: Date
    lessons: Lesson[]
}