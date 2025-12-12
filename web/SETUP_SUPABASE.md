# Supabase Setup for T.A.C.O.S War Room

## Create the Messages Table

After creating your Supabase project and getting the credentials, you need to create the `messages` table.

### Option 1: SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste and run this SQL:

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON public.messages
  FOR SELECT USING (true);

-- Allow public insert access (server-side gating is enforced in API)
CREATE POLICY "Allow public insert" ON public.messages
  FOR INSERT WITH CHECK (true);
```

### Option 2: Using Supabase CLI

```bash
supabase db push
```

(Requires `schema.sql` file in your project)

## Environment Variables

Add these to your `.env` file in the `/web` directory:

```env
# Server-side (keep secret)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Client-side (for realtime subscriptions)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from:
- **Settings > API** in your Supabase dashboard
- `service_role` key = `SUPABASE_SERVICE_KEY` (keep secret, never commit)
- `anon` key = `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to share, for client-side only)

## Test Locally

```bash
# Start dev server
npm run dev

# Test message posting (will fail if wallet doesn't hold 100k tokens)
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello War Room","walletAddress":"YOUR_WALLET_ADDRESS","senderName":"YourName"}'

# Fetch messages
curl http://localhost:3000/api/messages
```

## Deploy to Netlify

See `DEPLOY_NETLIFY.md` for full deployment instructions.

Add the environment variables to Netlify dashboard **Site Settings > Build & Deploy > Environment**.
