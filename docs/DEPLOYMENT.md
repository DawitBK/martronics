# Deployment Guide

This guide covers the deployment process for the Martronics application.

## Prerequisites

-   A GitHub account with the project repository.
-   Accounts on Vercel (for frontend) and Railway or similar (for backend/database).

## Backend Deployment (Railway)

1.  **Create a New Project:** Log in to Railway and create a new project from your GitHub repository.
2.  **Configure Environment Variables:** Add the variables from your `.env` file to the Railway project settings.
    -   `PORT` (Railway usually sets this automatically)
    -   `DATABASE_URL` (If using Railway Postgres, this is auto-generated)
    -   `JWT_SECRET`
    -   `NODE_ENV` (Set to `production`)
3.  **Build Command:** `npm install`
4.  **Start Command:** `npm start`
5.  **Deploy:** Railway will automatically build and deploy your application.

## Frontend Deployment (Vercel)

1.  **Import Project:** Log in to Vercel and import your GitHub repository.
2.  **Configure Build Settings:**
    -   **Framework Preset:** Vite
    -   **Root Directory:** `frontend`
    -   **Build Command:** `npm run build`
    -   **Output Directory:** `dist`
3.  **Environment Variables:** Add any necessary frontend environment variables (e.g., `VITE_API_URL` pointing to your deployed backend).
4.  **Deploy:** Click "Deploy". Vercel will build and host your frontend.

## CI/CD

Both Vercel and Railway support automatic deployments.
-   **Push to Main:** Pushing changes to the `main` branch will trigger a new build and deployment on both platforms.
-   **Pull Requests:** Vercel creates preview deployments for pull requests.

## Post-Deployment Verification

1.  Visit the deployed frontend URL.
2.  Test the registration and login flows.
3.  Verify that products load correctly from the backend.
4.  Check that the cart functionality works.
