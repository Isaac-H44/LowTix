# LowTix

LowTix is a ticket resale platform focused on affordability and fairness. It purchases tickets quickly and sells at the lowest profitable rate near retail value. To discourage scalping, each user is limited to a maximum of 4 tickets per event.

## Tech Stack
- React PWA (Vite) for the client
- Express API (Node) for backend
- Supabase for database, auth, and SQL migrations/seeds

## Repository Layout
```
LowTix/
  client/            # React PWA (local dev: Vite)
  api/               # Express API (local dev: Node)
  supabase/          # SQL migrations + seeds
    migrations/
    seeds/
  docs/              # PRD, sitemap, OpenAPI, deployment notes
  README.md
  .gitignore
```

## Getting Started
- Client: Vite + React app to be initialized
- API: Express app to be initialized
- Supabase: add migrations and seeds as SQL files

## Notes
- Ensure `.env` files are created locally for each app when bootstrapped (not committed).
