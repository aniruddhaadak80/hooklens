# Contributing to HookLens

Small, focused PRs beat big rewrites.

1. Fork, branch (`feat/<short-name>`), keep the inspector deterministic — no randomness, no keys in `src/lib/inspect.ts`.
2. Every new API route needs error JSON (`{error}`) and must work with an empty database.
3. Run `npm run lint` and `npm run build` before pushing (needs `DATABASE_URL` in `.env.local` for full build).
4. Never commit `.env.local` or any connection string.

Be kind. MIT all the way.
