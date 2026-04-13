<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/da7e3bb6-961e-490f-8fb1-36bb7bce68b2

## Project Structure

- `frontend/` — React + Vite frontend application
- `backend/` — Express + MongoDB backend server

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env` file in the project root with required values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`
   - `GMAIL_USER`
   - `GMAIL_APP_PASS`
3. Run the app:
   `npm run dev`

The backend server serves the frontend application in development.
