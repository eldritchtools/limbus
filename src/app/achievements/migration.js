function getDefaultMigration(achievementsData) {
    return {
        season: achievementsData["__Season__"],
        tracking: {},
        additionalPoints: 0
    }
}

function handleMigration(data, achievementsData) {
    if (data.season === achievementsData["__Season__"]) {
        return data;
    } else {
        return getDefaultMigration(achievementsData);
    }
}

function constructAchievementsData(tracking, additionalPoints, achievementsData) {
    return {
        season: achievementsData["__Season__"],
        tracking: tracking,
        additionalPoints: additionalPoints
    }
}

export { getDefaultMigration, handleMigration, constructAchievementsData };
