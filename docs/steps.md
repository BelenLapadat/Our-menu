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
- [x] Create `lib/users.ts` — `findOrCreateUser()` on Google sign-in
- [x] Create `lib/session.ts` — `getSessionUser()` and `requireUser()`
- [x] Configure Auth.js in `auth.ts` (Google provider, JWT session, user id in token)
- [x] Add API route `app/api/auth/[...nextauth]/route.ts`
- [x] Add `middleware.ts` — redirect unauthenticated users to `/login`
- [x] Add `/login` page with “Continuar con Google”
- [x] Move app pages to `app/(main)/` so login has no navbar
- [x] Add `UserMenu` in navbar (avatar, name, sign out)
- [x] Call `requireUser()` in all server actions (meals, recipes, menus)
- [x] Update `.env.example` with auth variables

### Local verification

- [x] Run `npm run db:setup` to create/migrate `users` table
- [x] Run `npm run build` successfully
- [x] Manual test: sign in with Google locally
- [x] Manual test: sign out
- [x] Manual test: confirm user row in DB (`SELECT email, name FROM users;`)

---

## Completed earlier: Multi-menu and shared recipes

These features were built before auth and are not yet scoped per user/household.

- [x] Multiple menus (create, switch, delete with confirmation)
- [x] Menu switcher in navbar (far right)
- [x] Deletion notification for menus
- [x] Recipes shared across all menus (global recipe list)
- [x] Meals scoped per menu (`menu_id` on `meals`)
- [x] Active menu stored in cookie (`active-menu-id`)

**Note:** Until Phase 2, any signed-in user still sees all menus and recipes in the database. Auth establishes identity only; authorization comes next.

---

## Remaining: Household model (Phase 2)

Goal: each household has its own menus and recipes; multiple users can collaborate on the same household.

### Data model

- [ ] Add `households` table (`id`, `name`, `created_at`)
- [ ] Add `household_members` table (`household_id`, `user_id`, `joined_at`)
- [ ] Add `household_id` to `menus` and scope all menu queries
- [ ] Add `household_id` to `recipes` (or keep recipes household-scoped while shared across that household’s menus)
- [ ] Migration: assign existing menus/recipes to a default household

### Authorization

- [ ] Add `requireHouseholdAccess(householdId)` helper
- [ ] Replace `getMenus()` with `getMenusForUser(userId)`
- [ ] Scope `getRecipes()`, `getMealsBetween()`, etc. to the user’s active household
- [ ] Validate active menu cookie against household membership (not just cookie preference)
- [ ] Prevent IDOR: reject access to menu/meal/recipe IDs outside the user’s household

### First-login bootstrap

- [ ] On first sign-in: create household (e.g. “Mi hogar”) and add user as member
- [ ] On subsequent sign-ins: load user’s household(s)
- [ ] If migrating existing data: attach default household to pre-auth menus/recipes

### UI

- [ ] Household switcher (if supporting multiple households per user later)
- [ ] Menu switcher shows only menus in the current household
- [ ] Optional: show household name in navbar

---

## Remaining: Invitations (Phase 3)

Goal: invite another Google user to join the same household.

- [ ] Add `household_invites` table (token hash, household_id, email, expires_at, used_at)
- [ ] Owner flow: invite by email
- [ ] `/invite/[token]` page — accept invite after Google sign-in
- [ ] Validate token (not expired, single-use, email match optional)
- [ ] Rate-limit invite creation

---

## Remaining: Production deploy (when ready)

- [ ] Create Turso database
- [ ] Run `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:setup` on Turso
- [ ] Deploy to Vercel
- [ ] Set env vars: `TURSO_*`, `AUTH_*`
- [ ] Add production redirect URI in Google Console: `https://<your-app>.vercel.app/api/auth/callback/google`
- [ ] Move OAuth app to **In production** (or add all users as test users)

---

## Remaining: Optional polish

- [ ] Audit log (who changed meals/recipes)
- [ ] Read-only `viewer` role (deferred — no roles in v1)
- [ ] Real-time calendar updates for multiple editors
- [ ] Per-menu invites without full household access (deferred)

---

## Key files (auth)

| File | Purpose |
|------|---------|
| `auth.ts` | Auth.js config, Google provider, JWT/session callbacks |
| `middleware.ts` | Protect routes, redirect to `/login` |
| `lib/users.ts` | Create/update user on Google sign-in |
| `lib/session.ts` | `requireUser()` for server actions |
| `app/login/page.tsx` | Login UI |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js HTTP handlers |
| `scripts/schema.sql` | Includes `users` table definition |
| `lib/migrate.ts` | `migrateUsers()` and other migrations |

---

## Recommended order of work

1. ~~Finish manual auth testing locally~~ ✓ Done
2. Phase 2 — household model and data scoping
3. Phase 3 — invite flow
4. Production — Turso + Vercel + Google production redirect
