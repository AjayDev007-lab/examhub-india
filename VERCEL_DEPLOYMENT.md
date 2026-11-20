# EXAMHUB INDIA — VERCEL DEPLOYMENT GUIDE

This guide provides step-by-step instructions to upload and deploy **EXAMHUB INDIA** to **Vercel**.

---

## Method 1: Deploy Directly via Terminal (Fastest - 2 Minutes)

Vercel CLI is already verified and ready on your machine.

1. **Open PowerShell in the `frontend` folder:**
   ```powershell
   cd "c:\Users\Ajay Dev\OneDrive\Desktop\india hub\frontend"
   ```

2. **Run Vercel CLI:**
   ```powershell
   npx vercel
   ```

3. **Follow the interactive prompts:**
   - **Log in to Vercel:** Press `Enter` to log in via your browser (GitHub, GitLab, or Email).
   - **Set up and deploy?** Type `Y` and press `Enter`.
   - **Which scope do you want to deploy to?** Select your account.
   - **Link to existing project?** Type `N`.
   - **What's your project's name?** Press `Enter` (default: `examhub-india-frontend`).
   - **In which directory is your code located?** Press `Enter` (default: `./`).
   - **Want to modify build settings?** Type `N` (Next.js is automatically detected).

4. **Deploy to Production:**
   Once the preview deployment completes, promote it to production with:
   ```powershell
   npx vercel --prod
   ```
   Vercel will output your live URL (e.g., `https://examhub-india-frontend.vercel.app`).

---

## Method 2: Deploy via GitHub + Vercel Dashboard (Recommended for Continuous Updates)

1. **Push your repository to GitHub:**
   - Create a repository on [github.com](https://github.com/new) named `examhub-india`.
   - In your project root (`c:\Users\Ajay Dev\OneDrive\Desktop\india hub`):
     ```bash
     git init
     git add .
     git commit -m "Initial release of ExamHub India"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/examhub-india.git
     git push -u origin main
     ```

2. **Import into Vercel:**
   - Open [vercel.com/new](https://vercel.com/new).
   - Select your `examhub-india` repository and click **Import**.

3. **Configure Project Settings:**
   - **Framework Preset:** `Next.js` (detected automatically)
   - **Root Directory:** Click **Edit** next to Root Directory and select `frontend`.
   - **Build Command:** `pnpm run build` or `npm run build`
   - **Output Directory:** `.next`
   - **Environment Variables (Optional):**
     - Add `NEXT_PUBLIC_API_URL` pointing to your hosted FastAPI backend (e.g. `https://api.yourdomain.com`).

4. **Click Deploy:**
   Vercel will build the frontend, optimize assets, generate static routes, and publish the platform to a live HTTPS domain.

---

## Connecting the Backend

- The Next.js frontend has dynamic proxy rewrites configured in `next.config.mjs`.
- If you deploy the Python FastAPI backend to a cloud host (such as **Railway**, **Render**, **Koyeb**, or **AWS EC2**):
  - Set the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings to your backend URL.
  - All calls from the Next.js frontend to `/api/*` will automatically route to your backend.
