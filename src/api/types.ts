export const PdfPostResult = {
    SUCCESS: "SUCCESS",
    FORBIDDEN: "FORBIDDEN",
    EMPTY_PDF: "EMPTY_PDF",
    ALREADY_EXISTS: "ALREADY_EXISTS",
    UNRECOGNISABLE_DATE: "UNRECOGNISABLE_DATE",
    TIMEOUT: "TIMEOUT",
    UNKNOWN: "UNKNOWN"
}

export type PdfPostResult = typeof PdfPostResult[keyof typeof PdfPostResult];

export const ScheduleEvent = {
    WEBHOOK_TEST: "WEBHOOK_TEST",
    SCHEDULE_UPDATE: "SCHEDULE_UPDATE"
}

export type ScheduleEvent = typeof ScheduleEvent[keyof typeof ScheduleEvent];

export interface ScheduleUpdate {
    id: string;
    event: ScheduleEvent;
    timestamp: string;
}