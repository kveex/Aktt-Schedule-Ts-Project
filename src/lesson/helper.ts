import {Lesson, Schedule, ScheduleTarget, Subgroup} from "./types";

const months: string[] = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];

function prettifyScheduleDate(date: Date): string {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function prettifySchedule(schedule: Schedule, target: ScheduleTarget, value: string): string {
    const scheduleDate: string = prettifyScheduleDate(schedule.scheduleDate);
    let finalValue: string = value;
    let targetString: string = "";

    switch (target) {
        case "GROUP": {
            targetString = "группы";
            finalValue = value.toLocaleUpperCase();
            break;
        }
        case "TEACHER": {
            targetString = "преподавателя"
            break;
        }
    }
    if (schedule.lessons.length === 0) {
        return `${scheduleDate} нет пар для ${targetString} ${finalValue}`
    }

    let text: string = `Расписание на ${scheduleDate}`;

    text += `для ${targetString} ${finalValue}:\n\n`;

    for (const lesson of schedule.lessons) {
        text += prettifyLesson(lesson);
    }
    
    return text;
}

function prettifyLesson(lesson: Lesson): string {
    let text: string = "";
    

    const strSubGroup: string = subgroupToString(lesson.subgroup);

    text += `- Время: ${lesson.lessonTime}\n`
    if (lesson.lessonType != "PRACTICE") text += `- Предмет: ${lesson.subjectName}\n`
    text += `- Группа: ${lesson.groupName.toUpperCase()}\n`
    if (lesson.teacherName) text += `- Преподаватель: ${lesson.teacherName}\n`
    text += `- Кабинет: ${lesson.classroom}\n`
    
    if (lesson.subgroup !== Subgroup.BOTH) {
        text += `- Подгруппа: ${strSubGroup}\n`
    }
    text += "──────────────────────\n"

    return text;
}

export function subgroupToString(subGroup: Subgroup): string {
    switch (subGroup) {
        case Subgroup.FIRST: return "Первая";
        case Subgroup.SECOND: return "Вторая";
        case Subgroup.BOTH: return "Обе";
    }
}

export function stringToSubgroup(subgroup: string): Subgroup | undefined {
    switch (subgroup) {
        case "Первая": return Subgroup.FIRST;
        case "FIRST": return Subgroup.FIRST;
        case "Вторая": return Subgroup.SECOND;
        case "SECOND": return Subgroup.SECOND;
        case "Обе": return Subgroup.BOTH;
        case "BOTH": return Subgroup.BOTH;
        default: return undefined;
    }
}