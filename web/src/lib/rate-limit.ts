// Simple in-memory rate limiter (no external dependencies)
// Suitable for single-instance Cloud Run deployments

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

export function rateLimit(
    ip: string,
    { maxRequests = 15, windowMs = 60 * 1000 }: { maxRequests?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetTime) {
        store.set(ip, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
        return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: maxRequests - entry.count };
}
