import { Lesson } from "./lesson/types";
import { dateToString } from "./util/helper";

export class ApiCommunicator {
    private static _instance: ApiCommunicator;
    private static api_url: string;

    private constructor(api_url: string) {
        ApiCommunicator.api_url = api_url;
    }

    public static initialise(api_url: string) {
        const normalizedApiUrl = api_url.endsWith('/') ? api_url.slice(0, -1) : api_url;
        this._instance = new this(normalizedApiUrl);
    }

    public static get Instance() {
        return this._instance;
    }

    public static async getTeachersList(scheduleDate: Date): Promise<string[]> {
        const strDate = dateToString(scheduleDate);
        const url = `${this.api_url}/api/schedule/teachers/${strDate}`;

        return this.getList(url);
    }

    public static async getGroupsList(scheduleDate: Date): Promise<string[]> {
        const strDate = dateToString(scheduleDate);
        const url = `${this.api_url}/api/schedule/groups/${strDate}`;

        return this.getList(url);
    }

    private static async getList(url: string): Promise<string[]> {
        try{
            const response = await fetch(url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 404) {
                console.log(`По адресу [${url}] не было найдено списка!`)   
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
    
    public static async getStudentSchedule(scheduleDate: Date, group_name: string, subgroup: number): Promise<Lesson[]> {
        const strDate = dateToString(scheduleDate);
        const url = `${this.api_url}/api/schedule/student/${strDate}/${group_name}?subgroup=${subgroup}`;

        return await this.getSchedule(url);
    }

    public static async getTeacherSchedule(scheduleDate: Date, teacher_name: string): Promise<Lesson[]> {
        const strDate = dateToString(scheduleDate);
        const url = `${this.api_url}/api/schedule/teacher/${strDate}/${teacher_name}`;

        return await this.getSchedule(url);
    }

    private static async getSchedule(url: string): Promise<Lesson[]> {
        try{
            const response = await fetch(url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 404) {
                console.log(`По адресу [${url}] не было найдено расписания!`)   
            } else if (!response.ok) {
                throw new Error("Что-то случилось в процессе запроса!")
            }
            
            const result = await response.json();

            return result as Lesson[];
        } catch(error){
            console.error('Ошибка получения информации:', error);
            throw error;
        }
    }

    public static async subscribeHook(data: string) {
        const normalizedApiUrl = this.api_url.endsWith('/') ? this.api_url.slice(0, -1) : this.api_url;

        try{
            await fetch(`${normalizedApiUrl}/api/webhook`,{
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: data
            })
            console.log("Hooked")
        }
        catch(error){
            throw new Error(`Failed to subscribe webhook: ${error}`);
        }
    }
}
