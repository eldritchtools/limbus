export function getNextDay() {
    const SHIFT = 3 * 60 * 60 * 1000; // 6AM KST

    const adjusted = new Date((new Date()).getTime() + SHIFT);

    adjusted.setUTCHours(0, 0, 0, 0);
    adjusted.setUTCDate(adjusted.getUTCDate() + 1);

    return new Date(adjusted.getTime() - SHIFT);
}

export function getNextDayOfWeek(dayOfWeek) {
    const SHIFT = 3 * 60 * 60 * 1000; // 6AM KST

    const adjusted = new Date((new Date()).getTime() + SHIFT);
    const currentDay = adjusted.getUTCDay();

    let diff = (dayOfWeek - currentDay + 7) % 7;
    if (diff === 0) diff = 7;

    adjusted.setUTCDate(adjusted.getUTCDate() + diff);
    adjusted.setUTCHours(0, 0, 0, 0);

    return new Date(adjusted.getTime() - SHIFT);
}

export function kstToLocalTime(str) {
    const hour12 = parseInt(str.match(/\d+/)[0]);

    const isPM = str.toUpperCase().includes("PM");
    let hour24 = hour12 % 12 + (isPM ? 12 : 0);
    const utcHour = (hour24 - 9 + 24) % 24;

    const now = new Date();
    const date = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        utcHour
    ));

    const localHour24 = date.getHours();
    const localIsPM = localHour24 >= 12;
    const localHour12 = localHour24 % 12 || 12;

    return `${localHour12}${localIsPM ? "PM" : "AM"}`;
}