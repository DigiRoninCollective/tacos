# GEMINI.md: Jedi Angel Space Hamster (JASH) Website

## Project Overview

This project is a static landing page for a fictional entity called "Jedi Angel Space Hamster" (JASH). The site features lore, mission parameters, and a real-time chat functionality.

The project is built with plain HTML, CSS, and JavaScript. The chat is powered by a Supabase backend for the database and real-time messaging. User authentication is handled via the Telegram Login Widget, with a serverless function on Vercel to verify the authentication hash.

The project is configured for easy deployment on Vercel.

## Key Technologies

*   **Frontend**: HTML, CSS, JavaScript
*   **Backend**: Supabase (Postgres database, Realtime)
*   **Authentication**: Telegram Login Widget
*   **Hosting**: Vercel (static site and serverless functions)

## Building and Running

### Local Development

There is no build step required for local development. You can run the site by opening the `index.html` file in a web browser.

For the chat to function, you will need to:
1.  Create a Supabase project and the `messages` table as described in `README.md`.
2.  Create a Telegram bot and get its username and token as described in `README.md`.
3.  Fill in the `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `TELEGRAM_AUTH_ENDPOINT` in `supabase-chat.js`.
4.  Update the `data-telegram-login` attribute in `index.html` with your bot's username.
5.  Run a local server to handle the Telegram authentication, or deploy to Vercel and use the production endpoint.

### Deployment

The project is pre-configured for deployment to Vercel. To deploy:

1.  Create a new Vercel project and link it to this repository.
2.  Set the `TELEGRAM_BOT_TOKEN` environment variable in your Vercel project settings. This is the token for your Telegram bot.
3.  The `vercel.json` file will handle the routing for the static files and the `telegram-auth` serverless function.

## Development Conventions

*   **Configuration**: All client-side configuration (Supabase keys, API endpoints) is managed in `supabase-chat.js`. The Telegram bot token is managed as a server-side environment variable.
*   **Styling**: The project uses CSS variables for theming, defined in the `<style>` block in `index.html`.
*   **Authentication**: The client-side code in `supabase-chat.js` calls the `/api/telegram-auth` endpoint to verify the Telegram user. The server-side logic in `api/telegram-auth.js` verifies the hash from Telegram to ensure the user is authentic.
*   **Chat**: The chat is implemented using Supabase's real-time capabilities. New messages are inserted into the `messages` table, and the client subscribes to changes in that table to display new messages in real-time.
