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
    CUSTOM: "CUSTOM",
} as const;

export type TimeSlot = typeof TimeSlot[keyof typeof TimeSlot];

export const Subgroup = {
    FIRST: 1,
    SECOND: 2,
    BOTH: 3,
} as const;

export type Subgroup = typeof Subgroup[keyof typeof Subgroup];

export interface Schedule {
    groupName: string,
    teacherNames: string[],
    time: TimeSlot,
    subjectName: string,
    room: string,
    subGroup: Subgroup,
    state: string
}

export function pretifySchedule(schedule: Schedule): string {
    let text: string = "";

    text += `- ${schedule.time} | ${schedule.subjectName}\n`
    text += `- Группа: ${schedule.groupName.toUpperCase()}\n`
    text += `- Преподаватели: ${schedule.teacherNames}\n`
    text += `- Кабинет: ${schedule.room}\n`
    text += `- Подгруппа: ${schedule.subGroup}\n`
    text += "---------------------------------------\n"

    return text;
}

export async function subscribeHook(api_url: string, data:string) {
    const normalizedApiUrl = api_url.endsWith('/') ? api_url.slice(0, -1) : api_url

    try{
        await fetch(`${normalizedApiUrl}/api/webhook`,{
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: data
        })
    }
    catch(error){
        throw new Error(`Failed to subscribe webhook: ${error}`)
    }
}

export class ApiCommunicator {
    private static _instance: ApiCommunicator;
    private static api_url: string;

    private constructor(api_url: string) {
        ApiCommunicator.api_url = api_url
    }

    public static initialise(api_url: string) {
        this._instance = new this(api_url)
    }

    public static get Instance() {
        return this._instance
    }
    
    public static async getStudentSchedule(date: Date, group_name: string, subgroup?: number) {
        try{
            const strDate = date.toISOString().split('T')[0]
            let url = `${this.api_url}/api/schedule/student/${strDate}/${group_name}`

            if (subgroup) {
                url += `?subgroup=${subgroup}`
            }

            const response = await fetch(url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.status === 404) {
                console.log(`Для группы [${group_name}] не было найдено расписания!`)
                return []
            } else if (!response.ok) {
                throw new Error("Что-то случилось в процессе запроса!")
            }
            const result = await response.json();

            return result as Schedule[];
        } catch(error){
            console.error('Error of getting data:', error);
            throw error;
        }
    }

    public static async getTeacherSchedule(date: Date, teacher_name: string, subgroup?: number) {
        try{
            const strDate = date.toISOString().split('T')[0]
            let url = `${this.api_url}/api/schedule/teacher/${strDate}/${teacher_name}`

            if (subgroup) {
                url += `?subgroup=${subgroup}`
            }

            const response = await fetch(url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.status === 404) {
                console.log(`Для преподавателя [${teacher_name}] не было найдено расписания!`)
                return []
            } else if (!response.ok) {
                throw new Error("Что-то случилось в процессе запроса!")
            }

            const result = await response.json();

            return result as Schedule[];
        } catch(error){
            console.error('Error of getting data:', error);
            throw error;
        }
    }
}
