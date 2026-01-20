# Phase 2: Security Hardening - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix critical security vulnerabilities in the dashboard before scaling complexity. This phase addresses:
- Service role key exposure in client-side code
- Missing rate limiting on API endpoints
- Lack of error monitoring and observability
- Insufficient input validation on API routes
- Insecure API key generation patterns

This phase does NOT include:
- Advanced auth features (2FA, SSO) - future phase
- Data encryption at rest - Supabase handles this
- Penetration testing - deferred to pre-launch
- Compliance certifications (SOC2, HIPAA) - out of scope for v1

</domain>

<decisions>
## Implementation Decisions

### Rate Limiting Strategy
**Claude's Discretion:** Full implementation flexibility
- Determine appropriate rate limits for telemetry endpoints (SDK sends 1Hz)
- Decide on different limits for mutation endpoints (job start/complete, settings)
- Choose rate limit enforcement pattern (sliding window, token bucket, fixed window)
- Implement appropriate scope (per-user, per-API-key, or per-IP)
- Design rate limit error responses (429 status, retry-after headers, error messages)

### Error Monitoring Approach
**Claude's Discretion:** Full implementation flexibility
- Choose monitoring tools (Sentry recommended in requirements, but open to alternatives)
- Determine whether to include performance monitoring or errors-only
- Implement appropriate PII sanitization in error logs
- Configure alert thresholds and notification channels (if any)
- Decide on client-side error reporting scope (full visibility vs critical only)

### API Key Security Patterns
**Claude's Discretion:** Full implementation flexibility
- Implement key generation following 'rm_ + 64 hex chars' pattern (from requirements)
- Determine key lifetime policy (never expire, time-based rotation, or activity-based)
- Choose key display pattern in UI (show once, masked with reveal, or always visible)
- Decide on multi-key support (single key per user vs multiple labeled keys)
- Implement anomaly detection and response for suspicious key usage

### Authentication Hardening
**Claude's Discretion:** Full implementation flexibility
- Determine whether to add secondary validation on top of Supabase auth
- Configure session timeout policy (rolling expiration, browser-session, or indefinite)
- Implement new device notification/confirmation (if any)
- Choose validation architecture (global middleware, per-route, or hybrid)
- Handle multi-device access patterns

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to industry-standard security approaches.

User trusts Claude to implement security best practices appropriate for:
- Companion dashboard for truck simulator game
- Real-time telemetry data at 1Hz sample rate
- Cloud-based architecture with Supabase backend
- Single-player experience (no social features in v1)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-security-hardening*
*Context gathered: 2026-01-20*
