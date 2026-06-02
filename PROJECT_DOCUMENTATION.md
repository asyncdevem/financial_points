# Personal Financial Points Aggregator Documentation

## Project Overview

The Personal Financial Points Aggregator is a web-based financial rewards dashboard that lets users view reward points, card benefits, public bank deals, and opportunity-cost insights in one place.

The core idea is a Unified Dashboard that consolidates financial reward data without permanently storing sensitive financial values such as balances, reward totals, or live account details. The system uses a Zero-Persistence / Volatile State architecture: live financial data is fetched into memory for the active session, shown to the user, and wiped when the user logs out or the session times out.

Users can also create a Session Snapshot as a downloadable PDF when they intentionally want to preserve a record of their current points and rewards before volatile data is cleared.

## Three-Phase Development Plan

### Phase 1: Frontend

Phase 1 focuses on the user experience, interface structure, visual system, and simulated interaction flows.

Deliverables:

- Authentication screens for registration and login.
- Unified Dashboard layout with locked, stale, refreshed, and wiped states.
- Mock Bank connection management screens.
- Secure Refresh flow with simulated OTP verification.
- Rewards summary and net-worth-style points valuation.
- Purchase recommendation form with opportunity-cost preview.
- Public deals browsing and filtering UI.
- Session Snapshot export interface.
- Settings and profile management screens.
- Frontend-only mocked data states for all major use cases.

### Phase 2: Database

Phase 2 introduces persistent storage only for non-sensitive data.

Persistent data may include:

- User profile details.
- Hashed passwords or authentication identity references.
- Mock Bank connection metadata.
- Encrypted mock API credentials where required.
- User preferences.
- Saved profile settings.

Persistent data must not include:

- Live balances.
- Live reward points.
- Fetched bank account values.
- Session-only recommendation results.
- Volatile reward snapshots unless explicitly exported by the user as a PDF.

### Phase 3: Backend

Phase 3 builds the server-side behavior behind the frontend.

Backend deliverables:

- User authentication and session management.
- Strict 15-minute inactivity timeout.
- Secure Refresh endpoint with simulated OTP / 2FA.
- Mock Bank API integrations.
- Volatile in-memory session data store.
- Optimization engine for card recommendations.
- Opportunity-cost calculation service.
- Public deals scraper and filtering service.
- Session Snapshot PDF generation.
- Logout and auto-wipe logic.

## System Goals

- Give users one dashboard for all rewards and points.
- Keep live financial data out of permanent storage.
- Show clear session security states to build user trust.
- Help users choose the most rewarding card for a purchase.
- Show missed-value analysis through opportunity-cost reporting.
- Allow intentional export through Session Snapshot.
- Keep the experience simple enough for general banking users.

## User Characteristics

The target users are general banking customers aged 18 or older who use multiple financial products such as credit cards, debit cards, loyalty programs, or insurance-linked rewards.

Users are expected to have basic internet literacy and familiarity with online banking concepts such as login, OTP, dashboard summaries, and account linking.

## Functional Requirements

### Session Control and Authentication

- Users can register with email and password.
- Users can log in with valid credentials.
- The system starts a volatile session after login.
- The session expires after 15 minutes of inactivity.
- Manual logout immediately clears volatile memory.
- Auto-timeout logs the user out and wipes session-held financial data.

### Mock Bank Connectivity

- Users can connect supported Mock Bank providers such as HBL and Meezan.
- Connected providers remain in a locked or stale state until Secure Refresh is performed.
- Users can add or remove Mock Bank connections.
- Removing a provider clears related volatile data from memory.

### Secure Data Retrieval

- Users must perform Secure Refresh to fetch live mock financial data.
- Secure Refresh uses simulated OTP / 2FA.
- Retrieved balances and reward points are held only in volatile memory.
- Retrieved financial values are never written to the database.

### Unified Dashboard

- Users can view connected providers.
- Providers show locked state before Secure Refresh.
- After refresh, the dashboard displays active reward balances and points valuation.
- The dashboard calculates total reward value from volatile session data.
- The dashboard must clearly show whether data is live, stale, locked, or wiped.

### Optimization Engine

- Users can enter purchase amount and category.
- The system compares eligible cards and reward rules.
- The system recommends the card with the highest expected benefit.
- The system calculates opportunity cost when a less optimal card is selected.

### Public Deals Scraper

- The system retrieves public discount deals from external sources.
- Users can filter deals by category.
- Users can filter deals by bank.
- Deals are displayed separately from private financial data.

### Reporting

- Users can export a Session Snapshot PDF.
- The snapshot compiles currently loaded volatile session data.
- Exporting is intentional and user-triggered.
- The system should remind users that live data will be wiped after logout or timeout.

## Non-Functional Requirements

### Performance

- Mock Bank data fetch should complete within 3 seconds.
- Optimization recommendations should return within 500 milliseconds.
- Dashboard state changes should feel immediate and clear.

### Security

- Live financial data must be stored only in volatile memory.
- Financial values must not be persisted to MongoDB or any other database.
- Data in transit should use TLS 1.3 in production.
- Passwords must be hashed before storage.
- Manual logout and session timeout must wipe volatile memory.

### Availability

- The dashboard should target 99.9 percent uptime in production.
- Failure states should be graceful and understandable to the user.

### Usability

- Users should always know whether they are viewing locked, stale, live, or wiped data.
- Sensitive actions should use clear confirmation and status feedback.
- The interface should support non-technical banking users.

## Use Case Summary

| ID | Use Case | Primary Actor | Result |
| --- | --- | --- | --- |
| UC-01 | User Registration | New User | User profile is created in the database |
| UC-02 | User Login | Registered User | User is authenticated and volatile session begins |
| UC-03 | Manage Profile | User | Profile settings are updated |
| UC-04 | Manage Mock Bank Connections | User | Bank connection metadata is added or removed |
| UC-05 | Secure Refresh | User | Live financial data is loaded into volatile memory |
| UC-06 | View Unified Dashboard | User | Dashboard displays the correct security and rewards state |
| UC-07 | Purchase Recommendation | User | Best card and opportunity cost are shown |
| UC-08 | Browse and Filter Public Deals | User | Filtered public deal feed is shown |
| UC-09 | Export Session Snapshot | User | PDF snapshot is downloaded |
| UC-10 | Manual Logout | User | Session is destroyed and volatile memory is wiped |
| UC-11 | Session Timeout | System Timer | User is logged out and volatile memory is wiped |

## Detailed Use Cases

### UC-01: User Registration

Primary actor: New User

Pre-condition: User has internet access.

Post-condition: A persistent user profile exists in the database.

Main success scenario:

1. User enters email and password.
2. System validates form input.
3. System hashes the password.
4. System creates the user account.

Frequency: Once per user.

### UC-02: User Login

Primary actor: Registered User

Pre-condition: User account already exists.

Post-condition: User is authenticated and a volatile session is initiated.

Main success scenario:

1. User enters credentials.
2. System validates password hash.
3. System starts a volatile session.
4. System routes user to the dashboard.

Frequency: Every session.

### UC-03: Manage Profile

Primary actor: User

Pre-condition: User is logged in.

Post-condition: Profile settings are changed.

Main success scenario:

1. User opens Settings.
2. User changes email or password.
3. System validates the change.
4. System saves allowed persistent profile changes.

Frequency: As needed.

### UC-04: Manage Mock Bank Connections

Primary actor: User

Pre-condition: User is logged in.

Post-condition: Bank connection metadata is added or removed.

Main success scenario:

1. User chooses a Mock Bank provider.
2. To add: system validates and stores mock connection credentials.
3. To remove: system deletes stored connection metadata.
4. System wipes any related volatile session data.

Frequency: Occasional.

### UC-05: Secure Refresh

Primary actor: User

Pre-condition: Bank providers are connected but locked or stale.

Post-condition: Live financial data is loaded into volatile memory.

Main success scenario:

1. User selects Secure Refresh.
2. System asks for Mock OTP.
3. User enters OTP.
4. System fetches points and balances from connected Mock Banks.
5. System stores fetched data only in volatile memory.

Frequency: Once or more per session.

### UC-06: View Unified Dashboard

Primary actor: User

Pre-condition: User is logged in.

Post-condition: Dashboard displays the correct system state.

Main success scenario:

1. User opens Dashboard.
2. System shows linked providers as locked if Secure Refresh has not run.
3. If refreshed, system totals session-held points and reward values.
4. Dashboard displays unified rewards and net-worth-style valuation.

Frequency: Continuous.

### UC-07: Purchase Recommendation

Primary actor: User

Pre-condition: Live card data exists in volatile memory.

Post-condition: Best card and opportunity cost are displayed.

Main success scenario:

1. User enters purchase amount.
2. User selects purchase category.
3. System calculates expected rewards for each eligible card.
4. System recommends the best card.
5. System shows opportunity cost for weaker alternatives.

Frequency: Multiple times per day.

### UC-08: Browse and Filter Public Deals

Primary actor: User

Pre-condition: Internet connection is available.

Post-condition: Filtered public deals are displayed.

Main success scenario:

1. System retrieves public deals through scraper service.
2. User applies category or bank filters.
3. System dynamically updates the deal list.

Frequency: Frequent.

### UC-09: Export Session Snapshot

Primary actor: User

Pre-condition: Live data is available in volatile memory.

Post-condition: PDF snapshot is downloaded.

Main success scenario:

1. User selects Export PDF.
2. System compiles currently loaded volatile data.
3. System generates a Session Snapshot report.
4. User downloads the PDF.

Frequency: Usually before logout.

### UC-10: Manual Logout

Primary actor: User

Pre-condition: User is logged in.

Post-condition: Session is destroyed and volatile memory is wiped.

Main success scenario:

1. User selects Logout.
2. System ends the session.
3. System wipes volatile memory immediately.
4. User is returned to the login screen.

Frequency: End of session.

### UC-11: Session Timeout

Primary actor: System Timer

Pre-condition: User has been inactive for more than 15 minutes.

Post-condition: User is logged out and volatile memory is wiped.

Main success scenario:

1. Timer detects 15 minutes of inactivity.
2. System automatically begins logout.
3. System clears volatile memory.
4. User is informed that the session timed out.

Frequency: Automatically when inactivity occurs.

## Volatile State Model

The application has two categories of data:

Persistent data:

- User profile.
- Authentication record.
- Mock Bank connection metadata.
- User preferences.

Volatile data:

- Reward balances.
- Points totals.
- Card benefit calculations.
- Live account summaries.
- Recommendation outputs.
- Opportunity-cost analysis for the current session.

Volatile data lifecycle:

1. User logs in.
2. Session starts with no live financial data.
3. User performs Secure Refresh.
4. Live data is loaded into RAM.
5. User views dashboard, recommendations, and reports.
6. User logs out or becomes inactive.
7. Volatile data is wiped.

## Success Criteria

- Users can understand the dashboard state without technical explanation.
- Financial values never enter persistent storage.
- Secure Refresh is required before live data appears.
- Logout and timeout visibly clear session data.
- Recommendation results are fast and easy to interpret.
- Session Snapshot provides a deliberate user-controlled export path.
