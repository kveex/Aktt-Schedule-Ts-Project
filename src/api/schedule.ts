import {apiClient} from "./client";
import axios, {HttpStatusCode} from "axios";
import {Schedule, ScheduleTarget, Subgroup} from "../lesson/types";

export async function postPdf(pdfBuffer: ArrayBuffer): Promise<boolean> {
    const formData = new FormData();

    const pdf = new Blob([pdfBuffer], { type: 'application/pdf' });

    formData.append('file', pdf);
    try {
        await apiClient.post("/schedule/pdf", formData);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === HttpStatusCode.Unauthorized) {
                console.error("По какой-то причине при отправке PDF, бот был не авторизован!")
                return false;
            } else if (error.response?.status === HttpStatusCode.BadRequest) {
                console.error(error.message);
                return false;
            } else {
                throw error;
            }
        }
    }
    return true;
}

export async function getListAll(): Promise<{groups: string[], teachers: string[]}> {
    const { data: groups } = await apiClient.get<string[]>("/schedule/groups");
    const { data: teachers } = await apiClient.get<string[]>("/schedule/teachers");

    return {
        groups: groups,
        teachers: teachers
    }
}

export async function getSchedule(
    { value, target, scheduleDate, subgroup }:
    { value: string; target: ScheduleTarget, scheduleDate?: Date | null, subgroup?: Subgroup | null}): Promise<Schedule> {
    const { data } = await apiClient.get<Schedule>("/schedule", {
        params: {
            value: value,
            target: target,
            scheduleDate: scheduleDate,
            subgroup: subgroup
        }
    });

    return {
        scheduleDate: new Date(data.scheduleDate),
        lessons: data.lessons
    };
}