# 🇪🇨 Cafe Cursor Quito – Cost of Living Comparator

Compare monthly living costs between Ecuadorian cities. Built with **Nest.js** (backend), **Next.js** (frontend), and **Supabase** (Postgres).

## Prerequisites

- Node.js 18+
- Docker (for Supabase local)
- Supabase CLI: `npm i -g supabase` or use `npx supabase`

## 1. Database (Supabase local)

```bash
# Start Supabase (Postgres + Studio)
npx supabase start

# Apply migrations and seed data (cities + living costs)
npx supabase db reset
```

- **Postgres**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio**: http://127.0.0.1:54323

## 2. Backend (Nest.js)

```bash
cd backend
cp .env.example .env   # optional: set PORT, DATABASE_URL, OPENAI_API_KEY
npm install
npm run start:dev
```

API: http://localhost:3001

- `GET /cities` – list cities
- `GET /cities/:id` – city + living costs
- `PATCH /cities/:id/costs` – update costs (body: `rent`, `food`, `transport`, `utilities`, `internet`)
- `GET /comparison?cityA=:id&cityB=:id` – compare two cities (includes optional `aiInsight` when `OPENAI_API_KEY` is set)

## 3. Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local   # optional: set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

App: http://localhost:3000

- Select **City A** and **City B**, then **Comparar**.
- View monthly breakdown (rent, food, transport, utilities, internet), totals, and which city is more affordable.

## Project structure

```
├── backend/          # Nest.js API
├── frontend/         # Next.js app
├── supabase/
│   ├── config.toml
│   ├── migrations/   # DB schema (cities, living_costs)
│   └── seed.sql      # Ecuador cities + cost data
└── Requirements.md
```

## Data

- **Cities**: Guayaquil, Quito, Cuenca, Santo Domingo, Machala, Manta, Portoviejo, Ambato, Esmeraldas.
- **Costs** are editable via `PATCH /cities/:id/costs` (stored in Supabase/Postgres).

## Bonus: AI-generated insight

The comparison response can include an `aiInsight` field: a short explanation of why one city is more affordable (e.g. lower rent, food, utilities).

1. Get an **OpenAI API key** from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. In `backend/.env`, set: `OPENAI_API_KEY=sk-your-key`.
3. Restart the backend. The comparison endpoint will then return `aiInsight` when available; the frontend shows it in a highlighted box.

If the key is missing or invalid, the app still works; the insight is simply omitted.
