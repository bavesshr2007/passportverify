# PassportVerify

## Current State
Full-stack passport verification app with:
- Multi-step passport application form for users
- Application status lookup by ID or passport number
- Admin dashboard with approve/reject controls and stats
- Internet Identity authentication
- Role-based access: guest, user, admin
- Admin claim currently requires a token from CAFFEINE_ADMIN_TOKEN environment variable (which is not visible in the Caffeine dashboard, making it inaccessible)

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `claimAdminWithToken(token: Text)` backend function: remove the token parameter and token validation entirely. Rename to `claimAdmin()`. The first non-anonymous user to call it becomes admin automatically.
- Frontend AdminDashboard: remove the token input field and the instruction to find a token in the Caffeine dashboard. Replace with a simple "Claim Admin Access" button that calls `claimAdmin()` directly.

### Remove
- Token input form from the "Claim Admin Access" card in AdminDashboard
- All references to CAFFEINE_ADMIN_TOKEN

## Implementation Plan
1. Regenerate backend with `claimAdmin()` (no token) replacing `claimAdminWithToken(token)`
2. Update AdminDashboard frontend to call `actor.claimAdmin()` instead of `actor.claimAdminWithToken(token)`, remove token state and input UI
