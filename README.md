
# Electrician Rebate Awareness Survey + Dashboard (Replit)

This is a tiny Express.js + EJS app that collects survey responses and shows a live dashboard with Chart.js.

## Quick Start on Replit
1. Create a new **Node.js** Repl.
2. Click the kebab menu (three dots) → **Upload file** and upload the ZIP.
3. In the Replit Shell, unzip it:
   ```bash
   unzip electrician-rebate-survey.zip -d .
   cd electrician-rebate-survey
   npm install
   npm start
   ```
4. Replit will open the webview. Share the public URL with your client.

> The app binds to `0.0.0.0` and uses `process.env.PORT` automatically (Replit compatible).

## Routes
- `/` — Survey form
- `/dashboard` — Live charts (aggregates from `data/responses.json`)
- `/admin` — Raw table of responses (keep link private)
- `/export.csv` — Download all responses as CSV

## Data
Responses are stored in `data/responses.json`. You can delete/clear it any time to reset.

## Customize
- Edit questions in `views/form.ejs`
- Tweak styling in `public/css/style.css`
- Change aggregations and charts in `index.js` and `views/dashboard.ejs`
