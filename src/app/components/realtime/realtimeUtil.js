export function ensureRoomPrefix(prefix, roomId) {
    return roomId.startsWith(`${prefix}:`) ? roomId : `${prefix}:${roomId}`;
}

const prefixes = ["chat:", "quiz:"];

export function trimPrefixes(roomId) {
    for (const str of prefixes)
        if (roomId.startsWith(str))
            return roomId.slice(str.length);

    return roomId;
}

export function extractRoomPrefix(roomId) {
    return roomId.split(":")[0];
}