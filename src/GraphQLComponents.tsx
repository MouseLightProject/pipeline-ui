const env = process.env.NODE_ENV || "development";

export const pollingIntervalSeconds = (env !== "production") ? 5 : 10;
