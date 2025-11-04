# Deployment Notes

## Environments
- Local: Vite dev server (client), Node/Express (API), Supabase project
- Prod: TBD (e.g., Vercel/Netlify for client, Render/Fly/Heroku for API)

## Env Vars
- Client: VITE_ prefixed Supabase keys/URL
- API: Supabase service key/URL and app secrets

## CI/CD
- Lint, typecheck, test, build
- Deploy client and API on main branch
