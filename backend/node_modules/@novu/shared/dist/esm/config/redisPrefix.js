export function getRedisPrefix() {
    let redisPrefix = '';
    if (process.env.REDIS_PREFIX) {
        redisPrefix = process.env.REDIS_PREFIX;
    }
    return redisPrefix;
}
//# sourceMappingURL=redisPrefix.js.map