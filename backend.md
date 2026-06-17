# Perkley Backend Spec

This file is the source of truth for backend scope, status, and acceptance criteria.

**Maintenance rule:** Update this file before or with every backend implementation step. When asked for progress, derive answers from the Feature Status Matrix below and the step sections.

## Overall Progress

| Area | Done | Partial | Not started |
| --- | ---: | ---: | ---: |
| Authentication & session | 4 | 0 | 0 |
| User & profiles | 14 | 2 | 0 |
| Campaigns | 6 | 0 | 0 |
| File uploads | 3 | 0 | 0 |
| Security foundation | 4 | 0 | 0 |
| Search & filters | 1 | 3 | 1 |
| Instagram integration | 1 | 1 | 3 |
| Applications | 4 | 0 | 0 |
| Submissions | 5 | 1 | 0 |
| Leaderboard | 0 | 0 | 3 |
| Dashboard | 0 | 0 | 4 |
| Notifications | 0 | 0 | 5 |
| Payments | 0 | 0 | 4 |
| Analytics | 0 | 0 | 4 |
| Admin | 0 | 0 | 6 |
| Background jobs | 0 | 0 | 4 |
| Future | 0 | 0 | 6 |

**Estimated completion:** ~44% of the full product backend (Steps 1–6 done locally; Steps 7–13 not started).

Last audited: 2026-06-17 (Step 6 submissions)

## Feature Status Matrix

Legend: **Done** = implemented in `apps/api` with routes/services; **Partial** = schema or partial logic only; **Not started** = no backend yet.

### Authentication

| Feature | Status | Notes |
| --- | --- | --- |
| Google Login | Done | `GET /api/auth/oauth/google/start`, `.../callback` |
| Logout | Done | `POST /api/auth/signout` |
| Session Management | Done | HTTP-only JWT cookie, `GET /api/auth/me` |
| Role Selection (Creator / Brand) | Done | Signup + OAuth start `?role=` |

Also done but not in original list: email/password signup & signin, Instagram OAuth (login/link).

### User

| Feature | Status | Notes |
| --- | --- | --- |
| Create User | Done | `POST /api/auth/signup` |
| Get User | Done | `GET /api/users/me`, `GET /api/auth/me` |
| Update User | Done | `PATCH /api/users/me` |

### Creator Profile

| Feature | Status | Notes |
| --- | --- | --- |
| Create Profile | Done | Created on signup/OAuth |
| Update Profile | Done | `PATCH /api/creator/profile` |
| Profile Completion | Done | Server-side completion score |
| Payment Details | Done | Encrypted UPI/bank, masked responses |
| Portfolio | Done | List/create/delete metadata |
| Verification Status | Partial | DB field exists; no review workflow |

### Brand Profile

| Feature | Status | Notes |
| --- | --- | --- |
| Company Profile | Done | `GET/PATCH /api/brand/profile` |
| Logo Upload | Done | Upload flow + `PATCH /api/brand/logo` |
| Website | Done | Field on brand profile |
| Company Verification | Partial | DB field exists; no review workflow |

### Campaigns

| Feature | Status | Notes |
| --- | --- | --- |
| Create Campaign | Done | `POST /api/campaigns` (draft) |
| Edit Campaign | Done | `PATCH /api/campaigns/:id` (draft only) |
| Delete Campaign | Done | `DELETE /api/campaigns/:id` (draft only) |
| Publish Campaign | Done | `POST /api/campaigns/:id/publish` |
| Archive Campaign | Done | `POST /api/campaigns/:id/archive` |
| Draft Support | Done | `draft` → `active` → `archived` workflow |

### Applications

| Feature | Status | Notes |
| --- | --- | --- |
| Apply to Campaign | Done | `POST /api/campaigns/:id/apply` |
| Withdraw Application | Done | `DELETE /api/campaigns/:id/apply` |
| List Applicants | Done | `GET /api/campaigns/:id/applications` |
| Accept/Reject Applicant | Done | `POST .../applications/:applicationId/accept|reject` |

Also done: `GET /api/creator/applications` for creator's own application history.

### Submissions

| Feature | Status | Notes |
| --- | --- | --- |
| Submit Instagram URL | Done | `POST /api/campaigns/:id/submissions` |
| Edit Submission | Done | `PATCH /api/campaigns/:id/submissions/mine` |
| Validate Submission | Done | `POST .../submissions/:submissionId/validate` |
| Review Submission | Done | `GET /api/campaigns/:id/submissions` (brand list) |
| Approve/Reject Submission | Done | `POST .../approve` and `POST .../reject` |

Also done: `GET /api/campaigns/:id/submissions/mine`, `GET /api/creator/submissions`.

Partial: hashtag/mention verification is URL/format only; Instagram API sync deferred to Step 11/13.

### Leaderboard

| Feature | Status | Notes |
| --- | --- | --- |
| Generate Leaderboard | Not started | Step 7 |
| Ranking Logic | Not started | Step 7 |
| Winner Selection | Not started | Step 7 |

### Dashboard

| Feature | Status | Notes |
| --- | --- | --- |
| Creator Dashboard | Not started | Step 8 |
| Brand Dashboard | Not started | Step 8 |
| Stats API | Not started | Step 8 |
| Recent Activity | Not started | Step 8 |

### Search & Filters

| Feature | Status | Notes |
| --- | --- | --- |
| Search Campaigns | Partial | Public list only; no text search |
| Filter by Niche | Done | `GET /api/campaigns?niche=` |
| Filter by Platform | Partial | Platform fixed to Instagram; no filter param |
| Filter by Reward | Not started | Step 8 |
| Sort | Partial | `publishedAt desc` only |

### Notifications

| Feature | Status | Notes |
| --- | --- | --- |
| New Campaign | Not started | Step 9 |
| Application Accepted | Not started | Step 9 |
| Submission Reviewed | Not started | Step 9 |
| Winner Announced | Not started | Step 9 |
| Payment Released | Not started | Step 9 |

### Payments

| Feature | Status | Notes |
| --- | --- | --- |
| Escrow | Not started | Step 10 |
| Release Payment | Not started | Step 10 |
| Refund | Not started | Step 10 |
| Transaction History | Not started | Step 10 |

### Analytics

| Feature | Status | Notes |
| --- | --- | --- |
| Campaign Analytics | Not started | Step 11 |
| Creator Analytics | Not started | Step 11 |
| Brand Analytics | Not started | Step 11 |
| Engagement Metrics | Not started | Step 11 |

### Instagram

| Feature | Status | Notes |
| --- | --- | --- |
| OAuth | Done | Login/link via Instagram OAuth |
| Fetch Profile | Partial | Profile stored on OAuth callback |
| Verify Followers | Not started | Step 11 / background jobs |
| Fetch Metrics | Not started | Step 11 |
| Sync Data | Not started | Background jobs |

### Admin

| Feature | Status | Notes |
| --- | --- | --- |
| Manage Users | Not started | Step 12 |
| Manage Brands | Not started | Step 12 |
| Manage Creators | Not started | Step 12 |
| Manage Campaigns | Not started | Step 12 |
| Manage Payments | Not started | Step 12 |
| Reports | Not started | Step 12 |

### File Uploads

| Feature | Status | Notes |
| --- | --- | --- |
| Brand Logo | Done | Prepare → upload → attach |
| Creator Avatar | Done | Prepare → upload → attach |
| Portfolio Images | Done | Prepare → upload → attach to item |

### Security

| Feature | Status | Notes |
| --- | --- | --- |
| JWT/Auth Middleware | Done | Session cookie + `requireAuth` |
| RBAC (Role-Based Access) | Done | `requireRoles(creator|brand|admin)` |
| Rate Limiting | Done | Auth and OAuth routes |
| Input Validation | Done | Zod on all write endpoints |

### Background Jobs

| Feature | Status | Notes |
| --- | --- | --- |
| Submission Verification | Not started | Step 13 |
| Leaderboard Updates | Not started | Step 13 |
| Notifications | Not started | Step 13 |
| Scheduled Campaign Expiry | Not started | Step 13 |

### Future

| Feature | Status | Notes |
| --- | --- | --- |
| AI Creator Matching | Not started | Post-MVP |
| Recommendation Engine | Not started | Post-MVP |
| Referral System | Not started | Post-MVP |
| Chat System | Not started | Post-MVP |
| Team Collaboration | Not started | Post-MVP |
| Email Automation | Not started | Post-MVP |
| Webhooks | Not started | Post-MVP |

## Development Rule

- Every backend change must ship with tests for the behavior it introduces or changes.
- After backend changes, run the relevant automated checks before calling the step done.
- Prefer pure utility/service tests first, then add DB-backed or route-level integration tests where the behavior depends on persistence or middleware.
- If a backend change cannot be tested yet because infrastructure is missing, note the exact gap in this file under the active step.

## Stack

- Runtime: Bun
- API: Express + TypeScript
- Database: Neon Postgres
- ORM: Prisma
- Validation: Zod
- Auth: HTTP-only session cookie containing signed JWT
- Tests: Bun test

## Step 1: Authentication, Session, RBAC

Status: Done for local backend foundation

### Goals

- Users can sign up and sign in with email/password.
- Users can start Google OAuth and Instagram OAuth.
- Users can sign out.
- API can identify the current session user.
- Protected routes can require authentication.
- Protected routes can require one or more roles.
- Inputs are validated with Zod.
- Auth endpoints are rate-limited.
- OAuth state is single-use and expires.
- OAuth provider tokens are encrypted before storage.

### User Roles

- `creator`
- `brand`
- `admin`

### Auth Endpoints

| Method | Path | Status | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Done | Creates user and basic role profile |
| POST | `/api/auth/signin` | Done | Email/password login |
| POST | `/api/auth/signout` | Done | Clears session cookie |
| GET | `/api/auth/me` | Done | Returns current user |
| GET | `/api/auth/oauth/google/start` | Done | Creates OAuth state and redirects |
| GET | `/api/auth/oauth/google/callback` | Done | Exchanges code and signs in |
| GET | `/api/auth/oauth/instagram/start` | Done | Creates OAuth state and redirects |
| GET | `/api/auth/oauth/instagram/callback` | Done | Exchanges code and signs in/links |

### Security Acceptance Criteria

- Session cookie is `httpOnly`.
- Session cookie is `secure` in production.
- JWT role must be one of `creator`, `brand`, `admin`.
- OAuth `state` is stored hashed, expires, and is consumed atomically.
- OAuth redirects only allow app-relative paths.
- OAuth provider access/refresh tokens are encrypted before DB persistence.
- Signup/signin and OAuth routes are rate-limited.
- RBAC middleware returns `401` for missing sessions and `403` for insufficient roles.

### Environment Variables

- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_TOKEN_ENCRYPTION_KEY`
- `SESSION_COOKIE_NAME`
- `CORS_ORIGIN`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `INSTAGRAM_CLIENT_ID`
- `INSTAGRAM_CLIENT_SECRET`
- `INSTAGRAM_REDIRECT_URI`

### Remaining In Step 1

- Add real integration tests against a test database.
- Run OAuth end-to-end with real Google/Instagram apps.
- Add refresh-token/session rotation if needed.

## Step 2: User And Profiles

Status: Done for local backend foundation

### Goals

- Users can fetch and update safe account fields.
- Creators can fetch and update their creator profile.
- Creators can save encrypted payout details.
- Creators can manage portfolio metadata.
- Brands can fetch and update their company profile.
- Profile completion is calculated server-side.
- Creator routes require `creator` role.
- Brand routes require `brand` role.

### Endpoints

| Method | Path | Status | RBAC | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/users/me` | Done | Any authenticated user | Account + role summary |
| PATCH | `/api/users/me` | Done | Any authenticated user | Safe account/profile display fields |
| GET | `/api/creator/profile` | Done | `creator` | Creator profile + completion |
| PATCH | `/api/creator/profile` | Done | `creator` | Update creator profile |
| PATCH | `/api/creator/payment-details` | Done | `creator` | Stores encrypted payout method |
| GET | `/api/creator/portfolio` | Done | `creator` | List portfolio metadata |
| POST | `/api/creator/portfolio` | Done | `creator` | Add portfolio item metadata |
| DELETE | `/api/creator/portfolio/:id` | Done | `creator` | Delete own portfolio item |
| GET | `/api/brand/profile` | Done | `brand` | Brand profile + completion |
| PATCH | `/api/brand/profile` | Done | `brand` | Update brand profile |

### Creator Profile Completion

Completion is calculated from:

- Display name
- Instagram handle
- At least one niche
- At least one content type
- Location
- Payout method
- At least one portfolio item

### Brand Profile Completion

Completion is calculated from:

- Brand name
- Bio
- Industry
- Website
- Work email
- Logo URL
- At least one social link

### Security Acceptance Criteria

- User cannot update role, status, email verification, or trust score through profile routes.
- Creator profile endpoints reject non-creators.
- Brand profile endpoints reject non-brands.
- Payout UPI/bank values are encrypted before DB persistence.
- Payout API responses only expose masked values.
- Portfolio operations are scoped to the authenticated creator.

### Tests

- Profile completion calculations
- Instagram handle normalization
- Payout masking helpers
- Creator profile input validation
- Brand profile input validation
- Payment details validation
- Portfolio metadata validation

### Remaining In Step 2

- Run Prisma migration against Neon.
- Add DB-backed integration tests for profile route services.
- Connect frontend profile/onboarding screens to these APIs.

## Step 3: File Uploads

Status: Done for local backend foundation

### Goals

- Brands can upload and attach a logo.
- Creators can upload and attach an avatar.
- Creators can upload and attach portfolio images.
- Uploads are validated for owner, mime type, byte size, and purpose.
- Upload bytes are stored through a storage adapter, not inline in profile rows.
- Media metadata is persisted in the database.
- Uploads use short-lived signed upload tokens.

### Flow

1. Client requests upload preparation for a specific purpose.
2. Backend validates role, file metadata, and purpose constraints.
3. Backend creates a pending `MediaAsset` and returns an upload URL plus short-lived upload token.
4. Client uploads raw bytes to the upload URL.
5. Backend stores the file, marks the asset uploaded, and exposes a public media URL.
6. Client attaches the uploaded asset to the relevant profile or portfolio record.

### Endpoints

| Method | Path | Status | RBAC | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/uploads/prepare` | Done | Authenticated | Creates pending upload intent |
| PUT | `/api/uploads/content/:assetId` | Done | Signed token | Uploads raw file bytes |
| GET | `/api/media/:assetId` | Done | Public | Streams uploaded media |
| PATCH | `/api/creator/avatar` | Done | `creator` | Attach uploaded creator avatar |
| PATCH | `/api/brand/logo` | Done | `brand` | Attach uploaded brand logo |
| PATCH | `/api/creator/portfolio/:id/image` | Done | `creator` | Attach uploaded portfolio image |

### Security Acceptance Criteria

- Upload preparation requires authentication.
- Upload purpose is constrained by role.
- Raw upload requires a valid short-lived upload token.
- Upload token is scoped to one asset, owner, mime type, and byte size.
- Stored asset must belong to the attaching user.
- Only uploaded assets may be attached.
- Raw upload body size is limited by configured per-purpose rules.

### Tests

- Upload preparation schema validation
- Upload purpose role checks
- Upload mime type and size validation
- Upload token signing and verification
- Storage path/public path helpers

### Remaining In Step 3

- Swap local disk storage adapter for object storage in deployment environments.
- Add DB-backed integration tests for upload/attach flows.
- Add asset replacement and delete semantics.

## Step 4: Campaign CRUD And Workflow

Status: Done for local backend foundation

### Goals

- Brands can create campaigns in draft state.
- Brands can edit and delete draft campaigns.
- Brands can publish valid draft campaigns.
- Brands can archive active campaigns.
- API exposes public active campaigns and brand-owned campaigns.
- Campaign shape matches current product types: `bounty` and `campaign`.

### Endpoints

| Method | Path | Status | RBAC | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/campaigns` | Done | `brand` | Create draft campaign |
| GET | `/api/campaigns` | Done | Public | List active campaigns; filters: `type`, `niche`, `contentType` |
| GET | `/api/campaigns/mine` | Done | `brand` | List brand-owned campaigns |
| GET | `/api/campaigns/:id` | Done | Public/owner | Public sees active; owner sees own drafts |
| PATCH | `/api/campaigns/:id` | Done | `brand` owner | Edit draft campaign |
| DELETE | `/api/campaigns/:id` | Done | `brand` owner | Delete draft campaign |
| POST | `/api/campaigns/:id/publish` | Done | `brand` owner | Publish valid draft |
| POST | `/api/campaigns/:id/archive` | Done | `brand` owner | Archive active campaign |

### Workflow Rules

- New campaigns start as `draft`.
- Only draft campaigns may be deleted.
- Only draft campaigns may be published.
- Only active campaigns may be archived.
- Publishing requires all required fields for the selected campaign type.

### Campaign Types

- `bounty`
  - prize pool competition
  - requires first/second/third/top20Each prize values
- `campaign`
  - fixed payout
  - requires `fixedReward`, `minViewsThreshold`, and `maxCreators`

### Security Acceptance Criteria

- Campaign write actions require authenticated `brand` role.
- Brand can only mutate its own campaigns.
- Public listing only returns `active` campaigns.
- Publish validation enforces campaign-type-specific fields.

### Remaining In Step 4

- Add campaign schema and publish-validation unit tests.
- Run Prisma migration against Neon.
- Add DB-backed integration tests for campaign routes.
- Connect frontend listing forms and marketplace feed to these APIs.
- Extend public list with reward filter, platform filter, text search, and sort options (Step 8).

## Step 5: Applications

Status: Done for local backend foundation

### Goals

- Creators can apply to active campaigns.
- Creators can withdraw pending or accepted applications.
- Brands can list applicants for their own campaigns.
- Brands can accept or reject pending campaign applications.
- Bounty campaigns auto-accept on apply; fixed campaigns start as `pending`.
- Application eligibility enforces campaign state, deadline, follower minimum, and slot limits.

### Endpoints

| Method | Path | Status | RBAC | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/campaigns/:id/apply` | Done | `creator` | Apply to active campaign |
| DELETE | `/api/campaigns/:id/apply` | Done | `creator` | Withdraw own application |
| GET | `/api/campaigns/:id/applications` | Done | `brand` owner | List applicants; optional `?status=` |
| POST | `/api/campaigns/:id/applications/:applicationId/accept` | Done | `brand` owner | Accept pending application |
| POST | `/api/campaigns/:id/applications/:applicationId/reject` | Done | `brand` owner | Reject pending application |
| GET | `/api/creator/applications` | Done | `creator` | List own applications; optional `?status=` |

### Workflow Rules

- Only `active` campaigns accept applications.
- Applications cannot be created after the campaign deadline.
- Creator must meet `minFollowers` (null followers treated as 0).
- `campaign` type: new applications are `pending`; accept enforces `maxCreators`.
- `bounty` type: new applications are `accepted` immediately (open join).
- Creators may re-apply after `withdrawn` or `rejected`.
- Duplicate `pending` or `accepted` applications are blocked.
- Brand accept/reject is only valid for `campaign` type pending applications.
- Withdraw allowed for `pending` or `accepted` applications.

### Application Statuses

- `pending` — awaiting brand review (`campaign` type)
- `accepted` — creator may participate
- `rejected` — brand declined
- `withdrawn` — creator withdrew

### Security Acceptance Criteria

- Apply/withdraw require authenticated `creator` role.
- List/accept/reject require authenticated `brand` role and campaign ownership.
- Creators cannot review applications.
- Brands cannot apply to campaigns.

### Tests

- Application eligibility and status transition utilities
- Application schema validation
- Creator applications list query validation

### Remaining In Step 5

- Run Prisma migration against Neon (`campaign_applications` table).
- Add DB-backed integration tests for application routes.
- Connect frontend apply/withdraw and brand applicant review UI to these APIs.

## Step 6: Submissions

Status: Done for local backend foundation

### Goals

- Accepted creators can submit an Instagram post URL to a campaign.
- Creators can edit their submission before review closes.
- Server validates Instagram URL format and content type (reel/post/story).
- Brands can list, approve, and reject campaign submissions.
- Bounty submissions enter `competing` after validation; campaigns enter `under_review`.
- Engagement metrics fields exist for leaderboard work in Step 7.

### Endpoints

| Method | Path | Status | RBAC | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/campaigns/:id/submissions` | Done | `creator` | Submit Instagram URL |
| GET | `/api/campaigns/:id/submissions/mine` | Done | `creator` | Fetch own submission |
| PATCH | `/api/campaigns/:id/submissions/mine` | Done | `creator` | Edit post URL/note |
| GET | `/api/campaigns/:id/submissions` | Done | `brand` owner | List submissions; optional `?status=` |
| POST | `/api/campaigns/:id/submissions/:submissionId/validate` | Done | `creator` or `brand` | Re-run URL validation |
| POST | `/api/campaigns/:id/submissions/:submissionId/approve` | Done | `brand` owner | Approve `under_review` campaign submission |
| POST | `/api/campaigns/:id/submissions/:submissionId/reject` | Done | `brand` owner | Reject with reason |
| GET | `/api/creator/submissions` | Done | `creator` | List own submissions |

### Workflow Rules

- Creator must have an `accepted` application before submitting.
- One submission per accepted application.
- Only `active` campaigns accept submissions before the deadline.
- Invalid Instagram URLs are rejected on create/edit.
- URL content type must match campaign `contentType` when detectable.
- Bounty submissions become `competing` after validation.
- Campaign submissions become `under_review` after validation.
- Brand approve moves campaign submissions to `qualified`.
- Brand reject moves submissions to `rejected` with `rejectionReason`.
- Edit allowed for `submitted`, `under_review`, and `competing` while campaign is active.

### Submission Statuses

- `submitted` — validation failed or awaiting re-validation
- `competing` — active bounty entry
- `under_review` — campaign entry awaiting brand review
- `qualified` — brand-approved campaign entry
- `won` / `paid` / `not_qualified` — reserved for Steps 7 and 10
- `rejected` — brand declined

### Security Acceptance Criteria

- Submit/edit require authenticated `creator` with accepted application.
- Brand list/approve/reject require campaign ownership.
- Creators cannot approve or reject submissions.
- Validate endpoint allows creator (own submission) or brand (own campaign).

### Tests

- Instagram URL normalization and content-type detection
- Submission eligibility and status transition utilities
- Engagement score helper
- Submission schema validation

### Remaining In Step 6

- Run Prisma migration against Neon (`campaign_submissions` table).
- Add DB-backed integration tests for submission routes.
- Connect frontend submit dialog and brand review tables to these APIs.
- Instagram API verification of hashtag, mention, and live metrics (Steps 11/13).

## Future Steps

- Step 7: Leaderboard and winner selection
- Step 8: Dashboard APIs, stats, recent activity, search, filters, sort
- Step 9: Notifications (campaign, application, submission, winner, payment)
- Step 10: Payments and escrow
- Step 11: Analytics and Instagram metrics sync
- Step 12: Admin (users, brands, creators, campaigns, payments, reports)
- Step 13: Background jobs (verification, leaderboard, notifications, expiry)
- Post-MVP: AI matching, recommendations, referrals, chat, teams, email, webhooks
