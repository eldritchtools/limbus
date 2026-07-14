export function mergeUpcoming(data, upcomingData) {
    const result = {...data};
    Object.entries(upcomingData).forEach(([id, x]) => {
        result[id] = {...x, upcoming: true, date: upcoming.date};
    });
    return result;
}
