import { Lesson } from "./lesson/types";

export class ApiCommunicator {
    private static _instance: ApiCommunicator;
    private static api_url: string;

    private constructor(api_url: string) {
        ApiCommunicator.api_url = api_url;
    }

    public static initialise(api_url: string) {
        this._instance = new this(api_url);
    }

    public static get Instance() {
        return this._instance;
    }
    
    public static async getStudentSchedule(date: Date, group_name: string, subgroup?: number) {
        const normalizedApiUrl = this.api_url.endsWith('/') ? this.api_url.slice(0, -1) : this.api_url;

        try{
            const strDate = date.toISOString().split('T')[0]
            let url = `${normalizedApiUrl}/api/schedule/student/${strDate}/${group_name}`

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

            return result as Lesson[];
        } catch(error){
            console.error('Error of getting data:', error);
            throw error;
        }
    }

    public static async getTeacherSchedule(date: Date, teacher_name: string) {
        const normalizedApiUrl = this.api_url.endsWith('/') ? this.api_url.slice(0, -1) : this.api_url;

        try{
            const strDate = date.toISOString().split('T')[0]
            let url = `${normalizedApiUrl}/api/schedule/teacher/${strDate}/${teacher_name}`

            const response = await fetch(url,{
                method:'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.status === 404) {
                throw new Error(`Для преподавателя [${teacher_name}] не было найдено расписания!`)
            } else if (!response.ok) {
                throw new Error("Что-то случилось в процессе запроса!")
            }

            const result = await response.json();

            return result as Lesson[];
        } catch(error){
            console.error('Error of getting data:', error);
            throw error;
        }
    }

    public static async subscribeHook(data: string) {
        const normalizedApiUrl = this.api_url.endsWith('/') ? this.api_url.slice(0, -1) : this.api_url

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
            throw new Error(`Failed to subscribe webhook: ${error}`)
        }
    }
}
