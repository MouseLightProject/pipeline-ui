import * as moment from "moment";

export function calculateDurationFromNow(before: number): moment.Duration {
    const now = new Date();
    return calculateDuration(before, now.valueOf());
}

export function calculateDuration(before: number, after: number): moment.Duration {
    const durationSeconds = (after - before) / 1000;

    let duration;

    if (durationSeconds < 120) {
        duration = moment.duration(durationSeconds, "seconds");
    } else if (durationSeconds < 7200) {
        duration = moment.duration(durationSeconds / 60, "minutes");
    } else if (durationSeconds < 172800) {
        duration = moment.duration(durationSeconds / 3600, "hours");
    } else {
        duration = moment.duration(durationSeconds / 86400, "days");
    }

    return duration;
}
