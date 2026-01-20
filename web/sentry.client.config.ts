import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring - 10% sample rate
  tracesSampleRate: 0.1,

  // Session replay - errors only (full replay is expensive)
  replaysOnErrorSampleRate: 1.0, // 100% of errors get replay
  replaysSessionSampleRate: 0.01, // 1% of normal sessions

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore common noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded", // Browser quirk, not actionable
    "Non-Error promise rejection captured", // Often from third-party code
    "cancelled", // User navigation cancellations
  ],
});
