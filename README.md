# Commonplace

A lightweight, mobile friendly shared household dashboard for chores, shopping, and expenses.

## Run it

This MVP is a static web app with no package installation or build step. With Node.js installed, run the local development server:

```powershell
node server.js
```

Open `http://localhost:4173` on your computer. The server also prints LAN addresses; open one of those addresses on a phone connected to the same Wi-Fi to view the responsive mobile layout. Household data is saved in that browser's local storage.

For a shareable hackathon demo, publish the folder as a static site through Vercel, Netlify, or GitHub Pages. For Vercel, import the repository and choose the static site option (or use the Vercel CLI from a machine with Node.js installed). The root `index.html` is the entry point.

## What works

- Overview dashboard with upcoming chores, household members, shopping count, and your expense balance.
- Chore schedule with cleaning, garbage, and snow categories, assignees, dates, completion toggles, and filters.
- Shared shopping list with add, bought, remove, and clear bought actions.
- Household expenses with payer, equal split selection, monthly filtering, per member balances, and sample expenses.
- Add or remove housemates. Removing one reassigns their chores, removes expenses they paid, and updates other splits.
- Add or remove chores and expenses.
- Data persists in the current browser using `localStorage`.

## Current demo limitations

- Local storage is per browser/device. Changes do not synchronize between housemates.
- The starter household data is sample data; use **Clear site data** in the browser to restore the initial demo state.
- Splitwise connection is clearly labeled as coming soon. This build does not authenticate with or write expenses to Splitwise.
- Data and authentication are not production secured. Add a shared backend and household access controls before using real personal or financial data.

## Suggested next step

Move household state to Supabase Postgres, use Supabase Auth for membership, and enable Row Level Security so every query and mutation is restricted to the user's household. Keep any future Splitwise credentials and API calls on server side routes; verify Splitwise's current API terms and obtain any needed integration approval before release.
