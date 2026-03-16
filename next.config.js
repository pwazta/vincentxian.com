/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

// Shared security headers applied to all routes
const securityHeaders = [
  // Prevent clickjacking by disallowing iframe embedding
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing responses away from declared content-type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin as referrer to external sites, full URL for same-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year, including subdomains
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restrict browser features the site doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // CSP: allow self, inline styles (Next.js needs them), blob workers (Three.js),
  // Vercel analytics, and EmailJS API
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' blob: https://va.vercel-scripts.com",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

/** @type {import("next").NextConfig} */
const config = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default config;
