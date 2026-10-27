import { RateLimitError } from "./errors";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const memoryBuckets = new Map<string, number[]>();
let lastCleanup = 0;

function memoryRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (now - lastCleanup > 60_000) {
    lastCleanup = now;
    memoryBuckets.forEach((timestamps, bucketKey) => {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) {
        memoryBuckets.delete(bucketKey);
      }
    });
  }

  const active = (memoryBuckets.get(key) || []).filter((timestamp) => timestamp > cutoff);
  if (active.length >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((active[0] + windowMs - now) / 1000));
    memoryBuckets.set(key, active);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  active.push(now);
  memoryBuckets.set(key, active);
  return { allowed: true, remaining: Math.max(0, limit - active.length), retryAfterSeconds: 0 };
}

async function redisRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const now = Date.now();
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
    local count = redis.call('ZCARD', key)
    if count >= limit then
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      return {0, tonumber(oldest[2]), 0}
    end
    redis.call('ZADD', key, now, tostring(now) .. '-' .. tostring(math.random()))
    redis.call('PEXPIRE', key, window)
    return {1, 0, limit - count - 1}
  `;

  try {
    const response = await fetch(url.replace(/\/$/, ""), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        script,
        "1",
        key,
        String(now),
        String(windowMs),
        String(limit),
      ]),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[rate-limit:redis]", response.status, await response.text());
      return null;
    }
    const payload = (await response.json()) as { result?: [number, number, number] };
    const result = payload.result;
    if (!result) return null;

    if (result[0] === 0) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((result[1] + windowMs - now) / 1000)),
      };
    }
    return { allowed: true, remaining: Math.max(0, result[2]), retryAfterSeconds: 0 };
  } catch (error) {
    console.error("[rate-limit:redis]", error);
    return null;
  }
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const redisResult = await redisRateLimit(options);
  return redisResult || memoryRateLimit(options);
}

export async function enforceRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const result = await rateLimit(options);
  if (!result.allowed) {
    throw new RateLimitError(
      "Too many requests. Please try again shortly.",
      result.retryAfterSeconds
    );
  }
  return result;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function resetRateLimitsForTests() {
  memoryBuckets.clear();
  lastCleanup = 0;
}
