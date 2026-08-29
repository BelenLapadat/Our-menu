# Development steps — Nuestro Menusito

This document tracks what we have built and what remains from the multi-user household plan.

---

## Completed: Google login and authentication (Phase 1)

### Google Cloud setup (manual)

- [x] Create Google Cloud project
- [x] OAuth consent screen in **Testing** mode
- [x] Add test users
- [x] Create OAuth 2.0 Web client
- [x] Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- [x] Configure `.env.local` with `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

### App implementation

- [x] Install Auth.js (`next-auth@5.0.0-beta.32`)
- [x] Add `users` table to schema and migration (`lib/migrate.ts` → `migrateUsers()`)
- [x] Create `lib/users.ts` — `findOrCreateUser()` on Google sign-in (upsert via `ON CONFLICT`)
- [x] Create `lib/session.ts` — `getSessionUser()` and `requireUser()`
- [x] Configure Auth.js in `auth.ts` (Google provider, JWT session, user id in token)
- [x] Add API route `app/api/auth/[...nextauth]/route.ts`
- [x] Add `middleware.ts` — redirect unauthenticated users to `/login`
- [x] Add `/login` page with “Continuar con Google”
- [x] Move app pages to `app/(main)/` so login has no navbar
- [x] Add `UserMenu` in navbar (avatar, name, sign out)
- [x] Call `requireUserWithHousehold()` in all server actions (meals, recipes, menus)
- [x] Update `.env.example` with auth variables

### Security hardening (Phase 1 review)

- [x] Middleware reads HTTPS session cookie (`secureCookie` when protocol is `https:`)
- [x] `signIn` callback rejects Google accounts with `email_verified === false`
- [x] `findOrCreateUser()` upsert avoids concurrent first-sign-in race on `google_sub`
- [x] `assertAuthEnv()` — fail fast in production if `AUTH_SECRET` is missing (`lib/env.ts`)
- [x] Logged-in user on `/login` honors `callbackUrl` (middleware)
- [x] Login page sanitizes `callbackUrl` against open redirects

### Local verification

- [x] Run `npm run db:setup` to create/migrate `users` table
- [x] Run `npm run build` successfully
- [x] Manual test: sign in with Google locally
- [x] Manual test: sign out
- [x] Manual test: confirm user row in DB (`SELECT email, name FROM users;`)

---

## Completed earlier: Multi-menu and shared recipes

Built before auth; now scoped per household (Phase 2).

- [x] Multiple menus (create, switch, delete with confirmation)
- [x] Menu switcher in navbar (far right)
- [x] Deletion notification for menus
- [x] Recipes shared across all menus within a household
- [x] Meals scoped per menu (`menu_id` on `meals`)
- [x] Active menu stored in cookie (`active-menu-id`)

---

## Completed: Household model (Phase 2)

Goal: each household has its own menus and recipes; multiple users can collaborate on the same household.

### Data model

- [x] Add `households` table (`id`, `name`, `created_at`)
- [x] Add `household_members` table (`household_id`, `user_id`, `joined_at`)
- [x] Add `household_id` to `menus` and scope all menu queries
- [x] Add `household_id` to `recipes` (shared across that household’s menus)
- [x] Migration: assign existing menus/recipes to a default household
- [x] Migration: link existing users without membership to the default household (`linkUsersWithoutHousehold()`)

### Authorization

- [x] Add `requireHouseholdAccess()` helper (used by invite create in Phase 3)
- [x] Replace `getMenus()` with `getMenusForHousehold(householdId)`
- [x] Scope `getRecipes()`, `getMealsBetween()`, etc. to the user’s active household
- [x] Validate active menu cookie against household membership (not just cookie preference)
- [x] Prevent IDOR: reject access to menu/meal/recipe IDs outside the user’s household
- [x] `getMenu(id, householdId)` — household id required (no unscoped lookup)

### First-login bootstrap

- [x] Lazy bootstrap via `getUserHousehold()` / `ensureUserHousehold()` on first app use (not on sign-in — see Phase 3)
- [x] If no membership: create household (e.g. “Mi hogar”) and add user as member
- [x] If migrating/seed data exists: atomically claim memberless household (`claimLegacyHousehold()`)
- [x] Idempotent membership via `INSERT OR IGNORE`

### Security hardening (Phase 2 review)

- [x] `updateMeal()` verifies meal belongs to active menu before modifying `meal_recipes`
- [x] `deleteMeal()` throws if meal not found in active menu
- [x] Recipe/menu mutations check `rowsAffected` where applicable

### UI

- [ ] Household switcher (deferred — likely unnecessary; menus + invites may be enough)
- [x] Menu switcher shows only menus in the current household
- [x] ~~Show household name in navbar~~ removed — generic label added visual noise
- [x] Pages redirect to `/login` when household is missing (no blank renders)

---

## Completed: Invitations (Phase 3)

Goal: invite another Google user to join the same household.

- [x] Add `household_invites` table (token hash, household_id, email, expires_at, used_at)
- [x] Invite flow: any household member can invite by email (no owner role in v1)
- [x] `/invite/[token]` page — accept invite after Google sign-in
- [x] Validate token (not expired, single-use; email stored for reference, not enforced on accept)
- [x] Rate-limit invite creation (10 per member per household per hour)
- [x] Wire `requireHouseholdAccess()` on invite create
- [x] Defer household bootstrap on sign-in; accept adds membership without requiring prior household
- [x] Invite button in navbar with copy-link dialog

### Verification (production)

Verified on `https://our-menu-kappa.vercel.app` (Aug 2026).

- [x] Member creates invite and copies link (production URL)
- [x] Invitee opens link on another device, signs in with Google, accepts
- [x] Invitee sees inviter’s menus and recipes; both users can edit the same menu
- [x] Used invite link cannot be reused (single-use enforced)
- [ ] Expired invite shows the correct error (not manually tested)
- [ ] Invitee who already belongs to the household is redirected home (not manually tested)

---

## Completed: Production deploy (Phase 4)

Live at [our-menu-kappa.vercel.app](https://our-menu-kappa.vercel.app).

- [x] Create Turso database
- [x] Run `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:setup` on Turso
- [x] Deploy to Vercel
- [x] Set env vars: `TURSO_*`, `AUTH_*`, `AUTH_URL` (Production only)
- [x] Add production redirect URI in Google Console (`https://our-menu-kappa.vercel.app/api/auth/callback/google` — must use **https**, not http)
- [x] OAuth app in **Testing** mode with test users added
- [x] Phase 3 verification on deployed app (core invite flow confirmed)

---

## Remaining: Optional polish

- [ ] Audit log (who changed meals/recipes)
- [ ] Read-only `viewer` role (deferred — no roles in v1)
- [ ] Real-time calendar updates for multiple editors
- [ ] Per-menu invites without full household access (deferred)
- [ ] JWT/session revalidation against DB (revoke deleted users before token expiry)
- [ ] Automated tests for auth scoping and IDOR prevention

---

## Key files

| File | Purpose |
|------|---------|
| `auth.ts` | Auth.js config, Google provider, JWT/session callbacks (user upsert only; no household bootstrap on sign-in) |
| `middleware.ts` | Protect routes, redirect to `/login`, HTTPS-aware session cookie |
| `lib/env.ts` | `assertAuthEnv()` — production secret validation |
| `lib/users.ts` | Upsert user on Google sign-in |
| `lib/households.ts` | Household CRUD, membership, `ensureUserHousehold()`, legacy claim |
| `lib/invites.ts` | Invite create/accept, token hashing, rate limits |
| `lib/session.ts` | `requireUser()`, `requireUserWithHousehold()`, `requireHouseholdAccess()` |
| `lib/menus.ts` | `getMenusForHousehold()`, scoped menu CRUD |
| `lib/recipes.ts` | Household-scoped recipe CRUD |
| `lib/meals.ts` | Menu-scoped meals; ownership checks on update/delete |
| `lib/active-menu.ts` | Active menu cookie validated against household |
| `app/login/page.tsx` | Login UI |
| `app/invite/[token]/page.tsx` | Accept household invite after sign-in |
| `app/invites/actions.ts` | Server actions for create/accept invite |
| `app/components/invite-dialog.tsx` | Navbar invite UI |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js HTTP handlers |
| `scripts/schema.sql` | `users`, `households`, `household_members`, `household_invites`, scoped `menus`/`recipes` |
| `lib/migrate.ts` | `migrateHouseholds()`, `migrateInvites()`, and other migrations |

---

## Recommended order of work

1. ~~Finish manual auth testing locally~~ ✓ Done
2. ~~Phase 2 — household model and data scoping~~ ✓ Done
3. ~~Phase 1 & 2 security review fixes~~ ✓ Done
4. ~~Phase 3 — invite flow~~ ✓ Done
5. ~~Phase 4 — production deploy (Turso + Vercel + Google production redirect)~~ ✓ Done
6. ~~Phase 3 verification — multi-user invite testing on deployed URL~~ ✓ Done (core flow)
