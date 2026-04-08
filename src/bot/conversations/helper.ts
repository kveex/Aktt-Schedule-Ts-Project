export async function getSchedule<T>(fetcher: (date: Date) => Promise<T>) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        try {
            return await fetcher(tomorrow);
        } catch (error) {
            return await fetcher(today)
        }
}
