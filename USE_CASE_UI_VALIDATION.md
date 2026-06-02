# Use Case UI Validation

This document validates whether each required use case is represented in the current multipage UI.

## Summary

| ID | Use Case | UI Status | Route / Component |
| --- | --- | --- | --- |
| UC-01 | User Registration | Implemented in UI | `/register`, `AuthScreen` |
| UC-02 | User Login | Implemented in UI | `/login`, `AuthScreen` |
| UC-03 | Manage Profile | Implemented in UI | `/settings`, `SettingsScreen` |
| UC-04 | Manage Mock Bank Connections | Implemented in UI | `/banks`, `BanksScreen` |
| UC-05 | Secure Refresh | Implemented in UI | Shared `SecureRefreshModal`, shell refresh action, dashboard refresh action |
| UC-06 | View Unified Dashboard | Implemented in UI | `/dashboard`, `DashboardScreen` |
| UC-07 | Purchase Recommendation | Implemented in UI | `/recommend`, `RecommendScreen` |
| UC-08 | Public Deals: Browse and Filter | Implemented in UI plus bank-specific API scraper | `/deals`, `/deals/hbl`, `/deals/meezan`, `/deals/ubl`, `/api/deals`, `scrapeBankDeals` |
| UC-09 | Export Session Snapshot | Implemented in UI | `/reports`, `ReportsScreen` |
| UC-10 | Manual Logout | Implemented in UI | Shared app shell logout action, volatile wiped dashboard state |
| UC-11 | Session Timeout Auto-Wipe | Implemented in UI | `SessionProvider`, shared shell countdown, wiped state |

## Detailed Validation

### UC-01: User Registration

Status: Implemented in UI.

Route: `/register`

The registration screen includes email and password fields, a create-profile action, and a transition into the dashboard for the frontend prototype.

### UC-02: User Login

Status: Implemented in UI.

Route: `/login`

The login screen includes email and password fields, a dashboard entry action, and a link to registration.

### UC-03: Manage Profile

Status: Implemented in UI.

Route: `/settings`

The Settings screen includes profile fields for email and password, plus a save action.

### UC-04: Manage Mock Bank Connections

Status: Implemented in UI.

Route: `/banks`

The Banks screen shows connected Mock Bank providers, metadata status, live RAM-only state, refresh actions, and remove actions.

### UC-05: Secure Refresh

Status: Implemented in UI.

Components:

- `SecureRefreshModal`
- Shared shell Secure Refresh action.
- Dashboard Secure Refresh action.
- Bank Refresh action.

The modal includes Mock OTP input and indicates that fetched values are loaded into volatile memory for the current session.

### UC-06: View Unified Dashboard

Status: Implemented in UI.

Route: `/dashboard`

The dashboard shows session state, total reward value, total points, connected providers, missed value, provider table, rewards breakdown, best next purchase, public deals, and volatile lifecycle.

### UC-07: Purchase Recommendation

Status: Implemented in UI.

Route: `/recommend`

The recommendation screen includes purchase amount, category, current card, recommended card, expected points, reward value, opportunity cost, and card ranking.

### UC-08: Public Deals Browse and Filter

Status: Implemented in UI plus API scraper.

Routes:

- `/deals`
- `/deals/hbl`
- `/deals/meezan`
- `/deals/ubl`

Backend route: `/api/deals`

Server module: `app/lib/bank-deal-scraper.ts`

The Deals screens include bank/category/city/expiry/search filters and now request bank deals from the scraper API. The HBL scraper includes a source-specific city-wise parser for the official Konnect Foodie table. The scraper also fetches configured Meezan and UBL official pages and falls back to local deals if external pages are unavailable.

### UC-09: Export Session Snapshot

Status: Implemented in UI.

Route: `/reports`

The report screen includes a Session Snapshot preview, reward value, points, providers, included report sections, and Export PDF action. PDF generation is a backend-phase task and is not wired yet.

### UC-10: Manual Logout

Status: Implemented in UI.

Component: `AppShell`

The shell includes a logout action that wipes volatile session state and routes the user back to the dashboard wiped state.

### UC-11: Session Timeout Auto-Wipe

Status: Implemented in UI.

Component: `SessionProvider`

The session provider tracks activity, shows a countdown in the shell, and automatically wipes volatile state after 15 minutes of inactivity.

## Required UI Gaps Before Phase 1 Is Fully Complete

- Add actual PDF generation later in backend phase.
