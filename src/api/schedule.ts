import {apiClient} from "./client";
import axios, {HttpStatusCode} from "axios";
import {Schedule, ScheduleTarget, Subgroup} from "../lesson/types";
import {login} from "./auth";
import {dateToString} from "../util/helper";
import {PdfPostResult} from "./types";

export async function postPdf(pdfBuffer: ArrayBuffer, manualDate?: Date | undefined): Promise<PdfPostResult> {
    const formData = new FormData();

    const pdf = new Blob([pdfBuffer], { type: 'application/pdf' });

    formData.append('file', pdf);

    try {
        await apiClient.post("/schedule/pdf", formData, {
            params: {
                manualDate: manualDate
            }
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === HttpStatusCode.Unauthorized) {
                await login(process.env.BOT_API_LOGIN!, process.env.BOT_API_PASSWORD!);
                return postPdf(pdfBuffer, manualDate);
            } else if (error.response?.status === HttpStatusCode.Forbidden) {
                console.error("У служебного пользователя бота нет прав для отправки расписаний!")
                return PdfPostResult.FORBIDDEN;
            } else if (error.response?.status === HttpStatusCode.BadRequest) {
                const errorDetails: string = error.response?.data.errorDetails;
                switch (errorDetails) {
                    case "EMPTY": return PdfPostResult.EMPTY_PDF;
                    case "ALREADY_EXISTS": return PdfPostResult.ALREADY_EXISTS;
                    case "UNRECOGNISABLE_DATE": return PdfPostResult.UNRECOGNISABLE_DATE;
                    default: return PdfPostResult.UNKNOWN;
                }
            } else if (error.message.includes("timeout")) {
                return PdfPostResult.TIMEOUT;
            } else {
                throw error;
            }
        }
    }
    return PdfPostResult.SUCCESS;
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
    { value: string; target: ScheduleTarget, scheduleDate?: Date | null, subgroup?: Subgroup | null}): Promise<Schedule | null> {

    const date: string = scheduleDate ? dateToString(scheduleDate) : "";
    try {
        const {data} = await apiClient.get<Schedule>("/schedule", {
            params: {
                value: value,
                target: target,
                scheduleDate: date,
                subgroup: subgroup
            }
        });

        return {
            scheduleDate: new Date(data.scheduleDate),
            scheduleDateStatus: data.scheduleDateStatus,
            lessons: data.lessons
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === HttpStatusCode.NotFound) {
                return null
            }
        }
        throw error;
    }
}