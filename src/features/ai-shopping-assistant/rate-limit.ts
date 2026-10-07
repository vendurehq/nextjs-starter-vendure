// MVP safeguard for the free language model quota, not production rate limiting.
// State lives in one server process: it resets on restart and is not shared between instances,
// so distributed or serverless deployments need a shared limiter (for example one backed by Redis)
// in its place. It counts requests per process rather than per client because client IP headers
// can be spoofed. This module must stay free of runtime imports.

export interface RateLimiterOptions {
    limit: number;
    windowMs: number;
    now?: () => number;
}

/** A fixed-window limiter: returns true while fewer than `limit` requests started in the current window. */
export function createRateLimiter({limit, windowMs, now = Date.now}: RateLimiterOptions): () => boolean {
    let windowStart = Number.NEGATIVE_INFINITY;
    let count = 0;
    return () => {
        const time = now();
        if (time - windowStart >= windowMs) {
            windowStart = time;
            count = 0;
        }
        if (count >= limit) return false;
        count += 1;
        return true;
    };
}
