# JASH Site + Chat Quickstart

Static landing with Supabase-backed chat scaffold.

## Setup
1) Create a Supabase project.
2) Create table `messages`:
   ```sql
   create table if not exists public.messages (
     id uuid primary key default uuid_generate_v4(),
     created_at timestamptz default now(),
     name text,
     channel text,
     body text,
     telegram_id bigint
   );
   ```
3) Add RLS policies (see below).
4) In `supabase-chat.js`, set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `TELEGRAM_AUTH_ENDPOINT`.
5) In `index.html`, set `data-telegram-login="YOUR_BOT_USERNAME"` on the Telegram widget (create a bot via @BotFather).
6) Open `index.html` (or deploy) and test chat.

## RLS policies (minimal examples)
Enable RLS:
```sql
alter table public.messages enable row level security;
```

Open chat (no auth, public write/read):
```sql
create policy "Anyone can read messages" on public.messages
for select using (true);

create policy "Anyone can insert messages" on public.messages
for insert with check (true);
```

Authenticated-only (requires Supabase Auth):
```sql
create policy "Auth read" on public.messages for select using (auth.role() = 'authenticated');
create policy "Auth insert" on public.messages for insert with check (auth.role() = 'authenticated');
```

Per-channel restriction example (lock to allowed channels):
```sql
create policy "Channel allowlist" on public.messages
for insert with check (channel in ('main','alerts','raids'));
```

## Rate limiting
- **Client-side cooldown**: the chat UI has a 3s cooldown per sender to reduce spam. Adjust `COOLDOWN_MS` in `supabase-chat.js`.
- **Server-side (recommended)**:
  - Require auth so you can rate-limit per user via RLS. Example: block inserts if a user has sent 5+ messages in the last minute:
    ```sql
    create policy "Auth rate limit 5 per minute"
    on public.messages
    for insert
    with check (
      auth.role() = 'authenticated'
      and (
        select count(*) from public.messages m
        where m.created_at > now() - interval '1 minute'
          and m.name = new.name
      ) < 5
    );
    ```
  - Without auth, Postgres cannot see IP. Consider enabling Supabase Auth (email/OTP) and setting `name` from session to make rate limits meaningful.

## Deploy
- Static hosting (Vercel/Netlify/GitHub Pages): deploy the folder; ensure `supabase-chat.js` has keys.
- If using custom domain: point DNS to host; set base path if hosting under subpath.

## Notes
- Messages are unmoderated by default; add rate limits or moderation as needed.
- For persistence beyond 200 messages, adjust the `limit` in `supabase-chat.js` or add pagination.
- If you add auth, hook `name` from the session instead of the freeform input.

## Telegram auth (recommended approach)
Telegram Login Widget is the easiest auth layer that feels on-brand. Keep the bot token server-side; verify Telegram’s hash on the backend (Supabase Edge Function or tiny server) and issue an auth/session token for the client.

### Flow
1) Create a Telegram bot via @BotFather and set the domain for the login widget.
2) Add the Telegram Login Widget to `index.html` near the chat section (already scaffolded). Set `data-telegram-login="YOUR_BOT_USERNAME"`.
   ```html
   <script async src="https://telegram.org/js/telegram-widget.js?22"
     data-telegram-login="YOUR_BOT_USERNAME"
     data-size="large"
     data-onauth="onTelegramAuth(user)"
     data-request-access="write"></script>
   <script>
     async function onTelegramAuth(user) {
       // send `user` to your backend to verify hash; receive a signed session / sanitized payload
       const res = await fetch("/auth/telegram", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(user),
       });
       const payload = await res.json();
       // store session/JWT; set chat name to user.username or first_name
     }
   </script>
   ```
3) Verify on the server (Supabase Edge Function example) — set `TELEGRAM_AUTH_ENDPOINT` in `supabase-chat.js` to this route:
   ```js
   // /functions/telegram-auth/index.ts
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

   const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
   const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
   const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE")!;

   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

   function verifyTelegram(data) {
     const { hash, ...authData } = data;
     const crypto = new Crypto();
     const secret = crypto.subtle.importKey(
       "raw",
       new TextEncoder().encode(TELEGRAM_BOT_TOKEN),
       { name: "HMAC", hash: "SHA-256" },
       false,
       ["sign"]
     );
     const checkString = Object.keys(authData)
       .sort()
       .map((k) => `${k}=${authData[k]}`)
       .join("\n");
     return crypto.subtle.sign("HMAC", secret, new TextEncoder().encode(checkString))
       .then((sig) => {
         const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
         return hex === hash;
       });
   }

   Deno.serve(async (req) => {
     const body = await req.json();
     const ok = await verifyTelegram(body);
     if (!ok) return new Response("invalid hash", { status: 401 });

     // Create or fetch a user; issue a custom JWT or Supabase Auth session
     // Here: upsert a profile and return minimal payload for client
     await supabase.from("profiles").upsert({
       telegram_id: body.id,
       username: body.username,
       first_name: body.first_name,
       photo_url: body.photo_url,
     });

    return new Response(JSON.stringify({ username: body.username || body.first_name, telegram_id: body.id }), {
      headers: { "Content-Type": "application/json" },
    });
   });
   ```
4) In the chat client, lock the name field to the Telegram username from the verified response and enforce RLS to require `telegram_id`.

### RLS with Telegram ID (example, requires storing telegram_id per message)
```sql
alter table public.messages add column if not exists telegram_id bigint;

create policy "Telegram auth read" on public.messages
for select using (true); -- or restrict to matching telegram_id

create policy "Telegram auth insert" on public.messages
for insert with check (
  telegram_id is not null
);
```
Then, in `supabase-chat.js`, include `telegram_id` in inserts and hide the freeform name input once a Telegram session is set.

## Vercel deploy
- `vercel.json` included: serves static files + Node function at `/api/telegram-auth`.
- Set Vercel env var `TELEGRAM_BOT_TOKEN` (the token from @BotFather) for the auth function.
- Set `TELEGRAM_AUTH_ENDPOINT` in `supabase-chat.js` to your deployed URL, e.g. `https://your-app.vercel.app/api/telegram-auth`.
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `supabase-chat.js` before deploying.
- In BotFather, set the domain to your Vercel domain (or custom domain) so Telegram Login works.
