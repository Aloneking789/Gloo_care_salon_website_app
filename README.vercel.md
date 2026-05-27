Deployment to Vercel (SSR via Edge Function)

This project uses TanStack React Start and produces an SSR server entry at `src/server.ts` that exposes a `fetch` handler. To deploy on Vercel we run a small Edge function that forwards all requests to that server entry.

What I added:
- `api/[...all].ts` (Vercel Edge function) — forwards every request to the server entry (uses runtime: 'edge').
- `vercel.json` — sets the static build output to `dist` and routes everything to the Edge function so SSR works.

Quick deploy steps (recommended):
1. Install dependencies and build:

```bash
npm ci
npm run build
```

2. From the project root, create a Vercel project (if not already) and set the framework preset to "Other". In the Vercel dashboard:
   - Build Command: npm run build
   - Output Directory: dist
   - Root Directory: (leave empty or set to project root)

3. Add environment variables (if you have any: API_BASE, NODE_ENV, etc.) in the Vercel dashboard.

4. Deploy via Vercel CLI or by connecting the GitHub repo to Vercel and letting it build on push.

Notes:
- The Edge function imports `@tanstack/react-start/server-entry`. Make sure this package is installed (it is in package.json). Vercel's Edge runtime uses ESM and should support this import.
- If you need custom domain binding or special routes, configure them in the Vercel dashboard.
- If you prefer Cloudflare Workers for SSR (already present via `src/server.ts` and `wrangler.jsonc`), we can also keep that flow — but you asked for Vercel, so the Edge function is appropriate.
