import {Lesson, LessonTimeType, Schedule, ScheduleDateStatus, ScheduleTarget, Subgroup} from "./types";

const months: string[] = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];

function prettifyScheduleDate(date: Date, scheduleDateStatus: ScheduleDateStatus): string {
    let text: string = "";
    if (scheduleDateStatus === ScheduleDateStatus.ASSUMED) text += "предположительно "
    text += `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    return text;
}

export function prettifySchedule(schedule: Schedule, target: ScheduleTarget, value: string): string {
    const scheduleDate: string = prettifyScheduleDate(schedule.scheduleDate, schedule.scheduleDateStatus);

    let text: string = `Расписание на ${scheduleDate}\n`;

    switch (target) {
        case "GROUP": {
            text += `Группа ${value.toUpperCase()}`;
            break;
        }
        case "TEACHER": {
            text += `Преподаватель ${value}`;
            break;
        }
    }

    let lastTimeType: LessonTimeType | undefined;

    for (const lesson of schedule.lessons) {
        const { timeType, text: lessonText } = prettifyLesson(lesson, target, lastTimeType);
        lastTimeType = timeType;
        text += `${lessonText}`;
    }

    return text;
}

function prettifyLesson(lesson: Lesson, target: ScheduleTarget, lastTimeType: LessonTimeType | undefined): {timeType: LessonTimeType, text: string} {
    let text: string = "\n";

    if (lesson.lessonTimeType !== lastTimeType || lastTimeType === undefined) {
        text += `\n${lesson.lessonTime}\n`;
    }

    text += `${lesson.subjectName} каб. ${lesson.classroom} - `;

    switch (target) {
        case "GROUP": {
            text += `${lesson.teacherName}`;
            break;
        }
        case "TEACHER": {
            text += `${lesson.groupName.toUpperCase()}`;
        }
    }

    if (target === "GROUP" && lesson.subgroup !== Subgroup.BOTH) {
        text += ` (${subgroupToString(lesson.subgroup)})`;
    }

    return {
        timeType: lesson.lessonTimeType,
        text: text
    };
}

export function subgroupToString(subGroup: Subgroup): string {
    switch (subGroup) {
        case Subgroup.FIRST: return "1 подгр.";
        case Subgroup.SECOND: return "2 подгр.";
        case Subgroup.BOTH: return "Обе подгр.";
    }
}

export function stringToSubgroup(subgroup: string): Subgroup | undefined {
    switch (subgroup) {
        case "1 подгр.": return Subgroup.FIRST;
        case "FIRST": return Subgroup.FIRST;
        case "2 подгр.": return Subgroup.SECOND;
        case "SECOND": return Subgroup.SECOND;
        case "Обе подгр.": return Subgroup.BOTH;
        case "BOTH": return Subgroup.BOTH;
        default: return undefined;
    }
}