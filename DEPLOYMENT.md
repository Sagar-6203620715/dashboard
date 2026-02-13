# Vercel Deployment Guide

Step-by-step guide to deploy the Nova Dashboard to Vercel.

## Prerequisites

- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Vercel account ([sign up here](https://vercel.com/signup))
- ✅ Supabase project set up and running
- ✅ Environment variables ready

---

## Step 1: Prepare Your Code

### 1.1 Ensure your project builds locally

```bash
npm run build
```

If the build succeeds, you're ready to deploy. If there are errors, fix them first.

### 1.2 Commit and push to Git

Make sure all your changes are committed and pushed to your repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Important**: Ensure `.env.local` is in `.gitignore` (it should be already). Never commit environment variables to Git.

---

## Step 2: Deploy via Vercel Dashboard (Recommended)

### 2.1 Sign in to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Sign in with GitHub, GitLab, or Bitbucket (recommended for automatic deployments)

### 2.2 Import your project

1. Click **"Add New..."** → **"Project"**
2. Import your Git repository:
   - If connected to GitHub/GitLab/Bitbucket, select your repository
   - If not connected, click **"Import Git Repository"** and authorize Vercel
3. Find your `novadesigndashboard` repository and click **"Import"**

### 2.3 Configure project settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (or `novadesigndashboard` if your repo root is different)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 2.4 Add environment variables

**Before clicking "Deploy"**, add your Supabase environment variables:

1. Expand **"Environment Variables"** section
2. Add these two variables:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project-id.supabase.co
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   Value: your-anon-public-key-here
   ```

3. Make sure both are checked for:
   - ✅ **Production**
   - ✅ **Preview** (optional, for PR previews)
   - ✅ **Development** (optional, if using Vercel dev)

### 2.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Once deployed, you'll see a success message with your live URL (e.g., `https://novadesigndashboard.vercel.app`)

---

## Step 3: Configure Supabase for Production

### 3.1 Update Supabase Auth redirect URLs

1. Go to your Supabase dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel production URL to **"Redirect URLs"**:
   ```
   https://your-app.vercel.app/dashboard
   https://your-app.vercel.app/auth/callback
   ```
3. Add your Vercel preview URLs (optional, for PR previews):
   ```
   https://*.vercel.app/dashboard
   https://*.vercel.app/auth/callback
   ```

### 3.2 Verify Row Level Security (RLS)

Ensure your Supabase tables have RLS policies enabled. The `seed.sql` should have set these up, but verify:

1. Go to **Table Editor** → Select each table (`customers`, `orders`, `products`, `analytics_daily`)
2. Check **"RLS Enabled"** is turned on
3. Verify policies allow authenticated users to read data

---

## Step 4: Verify Deployment

### 4.1 Test your live site

1. Visit your Vercel URL (e.g., `https://novadesigndashboard.vercel.app`)
2. You should be redirected to `/auth/login`
3. Create a new account or log in
4. Verify:
   - ✅ Dashboard loads with KPIs
   - ✅ Charts display data
   - ✅ Orders/Customers/Inventory pages load
   - ✅ Data tables show data from Supabase
   - ✅ Sidebar collapse works
   - ✅ Mobile responsive layout works

### 4.2 Check build logs

If something doesn't work:

1. Go to Vercel dashboard → Your project → **"Deployments"**
2. Click on the latest deployment
3. Check **"Build Logs"** for errors
4. Check **"Runtime Logs"** for runtime errors

---

## Step 5: Set Up Custom Domain (Optional)

### 5.1 Add domain in Vercel

1. Go to **Project Settings** → **Domains**
2. Enter your domain (e.g., `dashboard.yourdomain.com`)
3. Follow Vercel's DNS instructions to add the required records

### 5.2 Update Supabase redirect URLs

Add your custom domain to Supabase Auth redirect URLs (same as Step 3.1).

---

## Alternative: Deploy via Vercel CLI

If you prefer command-line deployment:

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
# From your project root directory
vercel

# Follow prompts:
# - Link to existing project? No (first time) or Yes (updates)
# - Set up and deploy? Yes
# - Override settings? No (unless you need to change something)
```

### Add environment variables via CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# Paste your Supabase anon key when prompted
```

### Deploy to production

```bash
vercel --prod
```

---

## Troubleshooting

### Build fails

**Error**: `Module not found` or `Cannot find module`
- **Solution**: Ensure all dependencies are in `package.json` and run `npm install` locally first

**Error**: `Environment variable not found`
- **Solution**: Add environment variables in Vercel dashboard → Project Settings → Environment Variables

### Runtime errors

**Error**: `Failed to fetch` or `401 Unauthorized`
- **Solution**: Check Supabase environment variables are correct and RLS policies allow authenticated users

**Error**: `Redirect URL mismatch`
- **Solution**: Add your Vercel URL to Supabase Auth → URL Configuration → Redirect URLs

### Charts not showing data

- **Solution**: Verify `analytics_daily` table has data and RLS allows read access

### Tables show "No data found"

- **Solution**: Check Supabase RLS policies and ensure you're logged in

---

## Continuous Deployment

Once deployed, Vercel automatically deploys on every push to your main branch:

1. Push code to GitHub/GitLab/Bitbucket
2. Vercel detects the push
3. Builds and deploys automatically
4. You get a new deployment URL for each push

**Preview deployments**: Every PR gets its own preview URL automatically.

---

## Environment Variables Reference

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → `anon` `public` key |

---

## Quick Checklist

- [ ] Code is committed and pushed to Git
- [ ] `npm run build` succeeds locally
- [ ] Vercel account created
- [ ] Project imported from Git repository
- [ ] Environment variables added in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Deployment successful
- [ ] Live site tested (login, dashboard, tables, charts)
- [ ] Custom domain added (optional)

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**You're all set!** Your Nova Dashboard should now be live on Vercel. 🚀
