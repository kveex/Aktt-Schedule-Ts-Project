import { Lesson, Subgroup, TimeSlot } from "./types";

const months: string[] = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];

export function pretifySchedule(scheduleDate: Date, lessons: Lesson[], scheduleFor: string): string {
    let text: string = `Расписание на ${scheduleDate.getDate()} ${months[scheduleDate.getMonth()]} ${scheduleDate.getFullYear()} `;
    text += `для ${scheduleFor}:\n\n`;

    for (const lesson of lessons) {
        text += pretifyLesson(lesson);
    }
    
    return text;
}

function pretifyLesson(lesson: Lesson): string {
    let text: string = "";
    
    const strSubGroup: string | null = getReadableSubGroup(lesson.subGroup)

    text += `- Время: ${getReadableTime(lesson.time, lesson.customTime)}\n`
    text += `- Предмет: ${lesson.subjectName}\n`
    text += `- Группа: ${lesson.groupName.toUpperCase()}\n`
    text += `- Преподаватели: ${lesson.teacherNames}\n`
    text += `- Кабинет: ${lesson.room}\n`
    if (strSubGroup !== null) {
        text += `- Подгруппа: ${strSubGroup}\n`
    }
    text += "──────────────────────\n"

    return text;
}

function getReadableTime(time: TimeSlot, customTime: string | null): string {
    switch (time) {
        case TimeSlot.FIRST: return "8:30 - 10:00";
        case TimeSlot.FIRST_SHORT: return "8:30 - 9:10";
        case TimeSlot.SECOND: return "10:10 - 10:55 (перерыв) 11:15 - 12:00";
        case TimeSlot.SECOND_FULL: return "10:10 - 11:40";
        case TimeSlot.SECOND_SHORT: return "9:20 - 10:30";
        case TimeSlot.THIRD: return "12:10 - 13:40";
        case TimeSlot.THIRD_SHORT: return "10:40 - 11:50";
        case TimeSlot.FOURTH: return "13:50 - 14:20";
        case TimeSlot.FOURTH_SHORT: return "12:00 - 13:10";
        case TimeSlot.LEARNING_PRACTICE: return "Учебная практика";
        case TimeSlot.PRODUCTION_PRACTICE: return "Производственная практика";
        case TimeSlot.CUSTOM: return customTime!;
    }
}

function getReadableSubGroup(subGroup: Subgroup): string | null {
    switch (subGroup) {
        case Subgroup.FIRST: return "Первая";
        case Subgroup.SECOND: return "Вторая";
        case Subgroup.BOTH: return null;
        default: return null;
    }
}