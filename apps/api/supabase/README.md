# Supabase migrations

Apply in order:

| File | Purpose |
|------|---------|
| `001_waitlist.sql` | Early-access waitlist table |
| `002_core_schema.sql` | Core marketplace schema + RLS |

## Apply via SQL editor

1. Open your Supabase project → **SQL Editor**
2. Paste and run each file in order

## Apply via Supabase CLI

```bash
cd apps/api
supabase link --project-ref <your-project-ref>
supabase db push
```

## After migration

- Enable **Auth** providers you need (email, Google, etc.)
- Set `role` in user metadata on signup (`brand` | `creator`) — triggers auto-create `profiles` row
- Rotate service role key if it was ever exposed

## RLS summary

| Table | Brand | Creator | Service role |
|-------|-------|---------|--------------|
| `profiles` | Own row | Own row + public creator profiles | Full |
| `campaigns` | Own campaigns CRUD | Read active campaigns | Full |
| `campaign_participants` | Read own campaign participants | Own rows CRUD | Full |
| `submissions` | Read own campaign submissions | Own rows CRUD | Full |
| `metrics_snapshots` | Read via campaign | Read own | Full |
| `referral_events` | Read via campaign | Read own | Full |
| `escrow_transactions` | Read own campaigns | — | Full |
| `payouts` | Read own campaigns | Read own | Full |
| `notifications` | Own | Own | Full |
| `audit_log` | — | — | Full only |
