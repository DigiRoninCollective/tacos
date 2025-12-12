# Deploy to Netlify (Next.js)

This project uses Next.js (app router). To deploy to Netlify, we use the official Netlify Next plugin which supports server-side rendering and edge functions.

Steps
1. Ensure you have a Netlify account and the Netlify CLI (optional).
2. Add environment variables to your Netlify site settings:
   - `GATING_TOKEN_MINT`
   - `SOLANA_RPC_URL`
   - `MIN_HOLD_AMOUNT`

3. Install Netlify Next plugin during build (Netlify will install plugins automatically).
4. Connect your repo to Netlify and set build settings (or use `netlify.toml` in the repo):

   - Build command: `npm run build`
   - Publish directory: `.next`

5. Trigger deploy in Netlify dashboard or `netlify deploy --prod`.

Notes
- This app uses a lightweight JSON-backed store at `web/data/messages.json`, so no Supabase credentials are needed.
- If you need edge functions or serverless behavior, Netlify's plugin will handle them automatically for Next.js routes.
