import { stringToSubgroup } from "./lesson/helper";
import { Lesson, Schedule, Subgroup } from "./lesson/types";
import { dateToString, parseDate } from "./util/helper";

export class ApiCommunicator {
    private static _instance: ApiCommunicator;
    private static api_url: URL;

    private constructor(api_url: string) {
        ApiCommunicator.api_url = new URL(api_url);
    }

    public static initialise(api_url: string) {
        const normalizedApiUrl = api_url.endsWith('/') ? api_url.slice(0, -1) : api_url;
        this._instance = new this(normalizedApiUrl);
    }

    public static get Instance() {
        return this._instance;
    }

    public static async getList(type: "teachers" | "groups", scheduleDate?: Date): Promise<string[]> {
        this.api_url.pathname = `/api/schedule/${type}`
        if (scheduleDate) this.api_url.searchParams.append("date", dateToString(scheduleDate));

        try{
            const response = await fetch(this.api_url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 404) {
                console.log(`По адресу [${this.api_url}] не было найдено списка!`)   
            } else if (!response.ok) {
                throw new Error("Что-то случилось в процессе запроса!")
            }
            
            const result = await response.json();

            return result as string[];
        } catch(error){
            console.error('Ошибка получения информации:', error);
            throw error;
        }
    }

    public static async getSchedule({ type, name, scheduleDate, subgroup }:
        { type: "student" | "teacher", name: string, scheduleDate?: Date, subgroup?: Subgroup }): Promise<Schedule> {
        this.api_url.pathname = `/api/schedule/${type}/${name}`;

        if (scheduleDate) this.api_url.searchParams.append("date", dateToString(scheduleDate));

        if (subgroup) this.api_url.searchParams.append("subgroup", subgroup.valueOf().toString())

        try{
            const response = await fetch(this.api_url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 404) {
                console.log(`По адресу [${this.api_url}] не было найдено расписания!`)   
            } else if (!response.ok) {
                throw new Error("Что-то случилось в процессе запроса!")
            }
            
            const result = await response.json();

            const schedule: Schedule = {
                scheduleDate: parseDate(result.scheduleDate),
                lessons: result.lessons.map((lesson: any): Lesson => ({
                    ...lesson,
                    subGroup: stringToSubgroup(lesson.subGroup)
                }))
            }

            return schedule;
        } catch(error){
            console.error('Ошибка получения информации:', error);
            throw error;
        }
    }

    public static async subscribeHook(data: string) {
        this.api_url.pathname = "/api/webhook"
        try{
            await fetch(this.api_url,{
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: data
            })
            console.log(`Успешно создан вебхук по адресу [${this.api_url}]!`);
        }
        catch(error){
            throw new Error(`Не удалось создать вебхук: ${error}`);
        }
    }
}
