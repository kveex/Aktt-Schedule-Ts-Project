const ScheduleTarget = {
    GROUP: "GROUP",
    TEACHER: "TEACHER"
} as const;

export type ScheduleTarget = typeof ScheduleTarget[keyof typeof ScheduleTarget];

export const Subgroup = {
    FIRST: "FIRST",
    SECOND: "SECOND",
    BOTH: "BOTH"
} as const;

export type Subgroup = typeof Subgroup[keyof typeof Subgroup];

export const LessonType = {
    NORMAL: "NORMAL",
    DISTANT: "DISTANT",
    PRACTICE: "PRACTICE"
}

export type LessonType = typeof LessonType[keyof typeof LessonType];

export const LessonTimeType = {
    CUSTOM: "CUSTOM",
    ZEROTH: "ZEROTH",
    FIRST: "FIRST",
    FIRST_SHORT: "FIRST_SHORT",
    SECOND: "SECOND",
    SECOND_FULL: "SECOND_FULL",
    SECOND_SHORT: "SECOND_SHORT",
    THIRD: "THIRD",
    THIRD_SHORT: "THIRD_SHORT",
    FOURTH: "FOURTH",
    FOURTH_SHORT: "FOURTH_SHORT",
    FIFTH: "FIFTH",
    FIFTH_SHORT: "FIFTH_SHORT",
    PRODUCTION_PRACTICE: "PRODUCTION_PRACTICE",
    LEARNING_PRACTICE: "LEARNING_PRACTICE",
    PRE_DIPLOMA_PRACTICE: "PRE_DIPLOMA_PRACTICE"
}

export type LessonTimeType = typeof LessonTimeType[keyof typeof LessonTimeType];

export interface Lesson {
    groupName: string;
    teacherName: string;
    lessonTime: string;
    subjectName: string;
    classroom: string;
    subgroup: Subgroup;
    lessonTimeType: LessonTimeType;
    lessonType: LessonType;
}

export const ScheduleDateStatus = {
    REAL: "REAL",
    ASSUMED: "ASSUMED"
}

export type ScheduleDateStatus = typeof ScheduleDateStatus[keyof typeof ScheduleDateStatus];

export interface Schedule {
    scheduleDate: Date;
    scheduleDateStatus: ScheduleDateStatus;
    lessons: Lesson[];
}