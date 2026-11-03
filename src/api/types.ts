export const PdfPostResult = {
    SUCCESS: "SUCCESS",
    FORBIDDEN: "FORBIDDEN",
    EMPTY_PDF: "EMPTY_PDF",
    ALREADY_EXISTS: "ALREADY_EXISTS",
    UNKNOWN: "UNKNOWN"
}

export type PdfPostResult = typeof PdfPostResult[keyof typeof PdfPostResult];