# Nuestro Menusito

A personal meal planner built with Next.js, SQLite, and Turso.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create the local database:

```bash
npm run db:setup
```

This creates `data/menu.db` and seeds sample recipes when the database is empty.

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel + Turso

### 1. Create a Turso database

Install the [Turso CLI](https://docs.turso.tech/cli/introduction), then:

```bash
turso auth login
turso db create our-menu
turso db show our-menu --url
turso db tokens create our-menu
```

Save the database URL and auth token.

### 2. Apply the schema

Point the setup script at Turso (replace the URL and token):

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:setup
```

This creates the tables and seeds sample recipes if the database is empty.

### 3. Deploy to Vercel

Push the repo to GitHub, import it in [Vercel](https://vercel.com/new), and add these environment variables:

| Variable | Value |
|---|---|
| `TURSO_DATABASE_URL` | Your Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |

Deploy. No extra build configuration is required.

### Optional: use Turso locally

Copy `.env.example` to `.env.local` and fill in your Turso credentials. The app will use Turso instead of the local file.

```bash
cp .env.example .env.local
npm run db:setup
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run db:setup` | Create tables and seed sample data |
