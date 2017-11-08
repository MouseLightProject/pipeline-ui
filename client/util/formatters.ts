export function formatValue(val: number, truncate = 2, units = "") {
    if (val === null || val === undefined) {
        return "n/a";
    }

    if (units) {
        return `${val.toFixed(truncate)} ${units}`;
    } else {
        return `${val.toFixed(truncate)}`;
    }
}
export function formatCpuUsage(val: number) {
    return formatValue(val, 1, "%");
}

export function formatMemoryFromMB(val: number) {
    if (val >= 1000) {
        return formatValue(val / 1024, 1, "GB");
    } else {
        return formatValue(val, 2, "MB");
    }
}

export function formatDurationFromHours(val: number) {
    if (val >= 1.5) {
        return formatValue(val, 1, "hours");
    }
    else if (val * 60 >= 2) {
        return formatValue(val * 60, 1, "min");
    } else if (val * 3600 >= 1) {
        return formatValue(val * 3600, 0, "s");
    } else {
        return formatValue(val * 3600, 3, "s");
    }
}
