# Sa'arati — Meal Macro Tracker

Describe a meal in plain text (Arabic or English, e.g. `شاورما دجاج` or
"grilled chicken and rice") and Sa'arati uses an AI model to estimate its
calories and macros, then logs it to an orderly daily record.

> Photos are intentionally **not** used yet: DeepSeek's API is text-only today.
> The meal is described in text instead, and the AI provider is swappable — a
> vision provider can be added later behind the same interface.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS v3** (design tokens
  ported from the Sa'arati design system)
- **Prisma** + **SQLite** for storage
- **Swappable LLM** via an OpenAI-compatible adapter (Gemini / DeepSeek / OpenAI)

## Getting started (local)

Requires a PostgreSQL database. The easiest free option is a
[Neon](https://neon.tech) project — create one and copy its connection string.

```bash
npm install                       # installs deps + generates Prisma client
cp .env.example .env              # add DATABASE_URL, DIRECT_URL, and an API key
npx prisma migrate deploy         # apply the schema to your Postgres
npm run dev                       # http://localhost:3000
```

> For local dev you can point both `DATABASE_URL` and `DIRECT_URL` at the same
> Postgres connection string.

### Choosing an AI provider

Set two variables in `.env`. All three providers speak the same
OpenAI-compatible `/chat/completions` API, so only the key differs.

| Provider | `LLM_PROVIDER` | Notes |
| -------- | -------------- | ----- |
| Google Gemini | `gemini` | **Free tier** — recommended. Key from https://aistudio.google.com/apikey |
| DeepSeek | `deepseek` | Very cheap, text-only. Key from https://platform.deepseek.com |
| OpenAI | `openai` | Key from https://platform.openai.com |

```env
LLM_PROVIDER="gemini"
LLM_API_KEY="AIza..."
```

`LLM_BASE_URL` and `LLM_MODEL` are optional overrides; sensible defaults are
chosen per provider.

## How it works

1. **Scan tab (`/`)** — type what you ate, pick a meal type, tap **Analyze
   Meal**. `POST /api/analyze` sends the text to the model, which returns strict
   JSON (`items`, `calories`, `protein`, `carbs`, `fat`, `fiber`, `insight`),
   validated with Zod.
2. **Save** — `POST /api/meals` persists the entry to Postgres.
3. **Stats tab (`/log`)** — pick a day; `GET /api/meals?date=YYYY-MM-DD` returns
   that day's meals plus computed totals against the daily goal. Expand a card to
   see macros or delete the entry.

## Project structure

```
app/
  page.tsx            # Scan / describe-a-meal
  log/page.tsx        # Daily log
  api/analyze/        # text -> nutrition JSON
  api/meals/          # create / list-by-day / delete
components/           # UI (design-system components)
lib/
  llm/                # swappable OpenAI-compatible client + analyzeMeal
  db.ts               # Prisma singleton
  meals.ts            # serialization + daily totals
  types.ts            # Zod schema + shared types
prisma/schema.prisma  # Meal model (Postgres)
```

## Deploy to Vercel (free)

1. **Push this repo to GitHub** (already done).
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   `macros_analysis`.
3. **Create the database:** in the Vercel project, open **Storage → Create
   Database → Postgres** (Neon). Vercel auto-adds `DATABASE_URL` and the
   unpooled URL to the project's env vars.
4. **Map the direct URL:** add an env var `DIRECT_URL` set to the **unpooled**
   connection string Vercel created (e.g. the `..._URL_NON_POOLING` /
   `DATABASE_URL_UNPOOLED` value). Migrations use it.
5. **Add the AI key:** env vars `LLM_PROVIDER=gemini` and
   `LLM_API_KEY=<your Gemini key>` (free key from
   https://aistudio.google.com/apikey).
6. **Deploy.** The build runs `prisma migrate deploy` to create the table, then
   builds Next.js. Your app is live at `https://<project>.vercel.app`.

Every push to the branch redeploys automatically.

## Not yet included (future)

- Profile / progress screen and the BMR/TDEE Vitality Calculator
- Real photo/vision analysis (drop-in behind the LLM provider layer)
- Accounts / multi-device sync, full RTL layout & i18n
