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

export interface Lesson {
    groupName: string;
    teacherName: string;
    lessonTime: string;
    subjectName: string;
    classroom: string;
    subgroup: Subgroup;
    lessonType: LessonType;
}

export interface Schedule {
    scheduleDate: Date
    lessons: Lesson[]
}