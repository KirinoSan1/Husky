
// Format the TTL
export function formatTimeToClose(ttl: number): string {
    const remainingTime = ttl - Date.now();

    if (remainingTime <= 0) {
        return "Closed";
    }

    const remainingSeconds = Math.floor(remainingTime / 1000) % 60;
    const remainingMinutes = Math.floor(remainingTime / 1000 / 60) % 60;
    const remainingHours = Math.floor(remainingTime / 1000 / 60 / 60);

    if (remainingHours > 0) {
        return `${formatTime(remainingHours) + " h"}`;
    } else if (remainingMinutes > 0) {
        return `${formatTime(remainingMinutes) +" min"}`;
    } else {
        return `${formatTime(remainingSeconds) + " sec"}`;
    }
}

export function formatTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
}

//Format User
export function formatOnlineUsersCount(onlineUserCount: number) {
    const count = onlineUserCount !== undefined ? onlineUserCount : 0;

    if (count === 0) {
        return "No users online";
    } else if (count === 1) {
        return "1 user online";
    } else {
        return `${count} users online`;
    }
}