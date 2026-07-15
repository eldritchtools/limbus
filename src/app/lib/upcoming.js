export function mergeUpcoming(data, upcomingData, upcomingDate) {
    const result = {...data};
    Object.entries(upcomingData).forEach(([id, x]) => {
        result[id] = {...x, upcoming: true, date: upcomingDate};
    });
    return result;
}
