# Deploy to Netlify (Next.js)

This project uses Next.js (app router). To deploy to Netlify, we use the official Netlify Next plugin which supports server-side rendering and edge functions.

Steps
1. Ensure you have a Netlify account and the Netlify CLI (optional).
2. Add environment variables to your Netlify site settings:
   - `NEXT_PUBLIC_SUPABASE_URL` (anon client URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key for client)
   - `SUPABASE_URL` (server)
   - `SUPABASE_SERVICE_KEY` (server-only service key)
   - `GATING_TOKEN_MINT`, `SOLANA_RPC_URL`, `MIN_HOLD_AMOUNT`

3. Install Netlify Next plugin during build (Netlify will install plugins automatically).
4. Connect your repo to Netlify and set build settings (or use `netlify.toml` in the repo):

   - Build command: `npm run build`
   - Publish directory: `.next`

5. Trigger deploy in Netlify dashboard or `netlify deploy --prod`.

Notes
- Keep `SUPABASE_SERVICE_KEY` secret — set it in Netlify's Environment Variables and do not expose it to the client.
- `NEXT_PUBLIC_*` variables are exposed to the browser and are required by the client Supabase helper to subscribe to realtime.
- If you need edge functions or serverless behavior, Netlify's plugin will handle them automatically for Next.js routes.
