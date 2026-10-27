# Voklao – byg din egen AI

Voklao lader alle bygge deres egen AI-assistent på et minut, uden kode:

1. **Beskriv** din AI i én sætning. Claude bygger navn, instruktioner, velkomstbesked og forslag.
2. **Tilpas og test** den i en live forhåndsvisning.
3. **Del** den med et link. Alle med linket kan chatte med den.

Stack: React + Vite + Tailwind (frontend), Vercel Functions (`/api`), Claude API (Anthropic).
API-nøglen ligger kun på serveren og sendes aldrig til browseren.

## Kør lokalt

```bash
npm install
cp .env.example .env      # indsæt din ANTHROPIC_API_KEY
npm run dev               # http://localhost:5173
```

## Læg online (Vercel)

1. Gå til [vercel.com/new](https://vercel.com/new) og importér dette GitHub-repo.
2. Under **Environment Variables** tilføjer du `ANTHROPIC_API_KEY` (fra [console.anthropic.com](https://console.anthropic.com)).
3. Tryk **Deploy**. Vercel finder selv ud af, at det er et Vite-projekt.
4. Valgfrit: tilføj dit eget domæne under *Settings → Domains*.

## Struktur

| Mappe | Indhold |
|---|---|
| `src/` | Appen (forside, bygger, chat) |
| `api/chat.ts` | Streamer svar fra Claude |
| `api/generate.ts` | Bygger en AI ud fra en beskrivelse |
| `server/claude.ts` | Fælles Claude-klient, grænser og fejlbeskeder |

## Næste skridt

- Login og database (Supabase), så AI'er gemmes på tværs af enheder
- Rate limiting og betaling (Stripe) før stor trafik
- Mobilapp via Capacitor
