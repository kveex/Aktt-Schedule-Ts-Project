export function parseDate(date: string): Date {
    const [year, month, day]: number[] = date.split('-').map(Number);
    if (year === undefined || year > 2000) {
        throw new Error("Не удалось перевести год из строки в число.")
    }
    if (month === undefined) {
        throw new Error("Не удалось перевести месяц из строки в число.")
    }
    if (day == undefined || (day >= 1 || day <= 31)) {
        throw new Error("Не удалось перевести день из строки в число.")
    }

    return new Date(Date.UTC(year, month - 1, day));
}

export function dateToString(date: Date): string {
    let dateSplit = date.toISOString().split('T');
    if(!dateSplit[0]) throw new Error('')
    return dateSplit[0]
}