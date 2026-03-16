// Edge middleware: rate limiting for API routes
// Applied globally via matcher config below

import { type NextRequest, NextResponse } from "next/server";
import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Rate limiter setup ──────────────────────────────────────────────────────

const RATE_LIMITS = {
  "/api/contact": { requests: 3, window: "10 m" as Duration },
  "/api/auth": { requests: 20, window: "1 m" as Duration },
  "/api/trpc": { requests: 60, window: "1 m" as Duration },
};

function buildLimiters() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const limiters = new Map<string, Ratelimit>();

  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    limiters.set(
      path,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        prefix: `rl:${path}`,
      }),
    );
  }
  return limiters;
}

// Lazy-init so the Redis connection is only created once per cold start
let limiters: Map<string, Ratelimit> | null | undefined;
function getLimiters() {
  if (limiters === undefined) limiters = buildLimiters();
  return limiters;
}

// ── IP extraction ───────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Middleware handler ──────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const pool = getLimiters();
  if (!pool) return NextResponse.next(); // no Upstash configured, skip gracefully

  // Match the longest prefix first (e.g. /api/contact before /api)
  const pathname = req.nextUrl.pathname;
  const matchedPath = Object.keys(RATE_LIMITS)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => pathname.startsWith(prefix));
  if (!matchedPath) return NextResponse.next();

  const limiter = pool.get(matchedPath);
  if (!limiter) return NextResponse.next();

  // Fail open: if Redis is unreachable, let the request through rather than 500-ing
  try {
    const ip = getClientIp(req);
    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(limit));
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    return res;
  } catch (err) {
    console.error("[middleware] Rate limit check failed, allowing request:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
