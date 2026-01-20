import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.1,

  // Environment
  environment: process.env.NODE_ENV,

  // PII sanitization - scrub API keys BEFORE sending
  beforeSend(event, hint) {
    // Scrub API keys from request data
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      if (data.api_key) {
        data.api_key = "[REDACTED]";
      }
    }

    // Scrub from breadcrumbs (HTTP requests captured as breadcrumbs)
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data?.api_key) {
          breadcrumb.data.api_key = "[REDACTED]";
        }
        return breadcrumb;
      });
    }

    // Scrub from extra context (catch-all for any api_key, token, secret)
    if (event.extra) {
      Object.keys(event.extra).forEach(key => {
        if (key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          event.extra![key] = "[REDACTED]";
        }
      });
    }

    return event;
  },

  // Ignore common noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
});
