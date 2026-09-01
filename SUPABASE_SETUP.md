# 🚀 Supabase & Vercel Setup Guide for SkeuoVault

This guide walks you through setting up your **Supabase PostgreSQL Database** and deploying your project live to **Vercel**.

---

## 📦 Part 1: Setting up Supabase Database

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Choose your Organization, enter a Project Name (e.g., `skeuovault-inventory`), and set a strong database password.
4. Select your preferred region and click **Create new project**.

### Step 2: Run the SQL Schema Migration
1. In your Supabase Dashboard, click on the **SQL Editor** icon in the left navigation sidebar.
2. Click **New query**.
3. Open the file [`supabase_schema.sql`](./supabase_schema.sql) in this repository and copy its entire contents.
4. Paste the SQL into the Supabase SQL Editor and click **Run** (or press `Ctrl+Enter`).
5. All tables (`categories`, `products`, `stock_movements`, `deliveries`, `delivery_items`, `invoices`, `invoice_items`, `expenses`, `receivables_payables`, `activity_logs`, `users`), RLS security policies, and initial sample inventory data are now created!

### Step 3: Get Your API Credentials
1. Go to **Project Settings** (gear icon at the bottom of the left sidebar) -> **API**.
2. Find:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> `anon` / `public` key (starts with `ey...`)

---

## 💻 Part 2: Local Development Configuration

1. Create a `.env` file in the root of your project:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Part 3: Deploying Live to Vercel

### Step 1: Import GitHub Repository in Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Select your repository: `JustinFrias/ISM-app`.
4. Framework Preset will automatically detect **Vite**.

### Step 2: Add Environment Variables in Vercel
In the **Environment Variables** section during project import (or in Settings -> Environment Variables after deployment), add:
- `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`

### Step 3: Deploy
1. Click **Deploy**.
2. Vercel will build and publish your app globally with ultra-low latency.
3. The included `vercel.json` ensures that deep URLs (like `/admin`, `/inventory`, `/stocks`) route correctly without 404 errors.

---

## 🛡️ Architecture & Offline Graceful Fallback
- **Offline / Zero-Config Friendly**: If Supabase credentials are not supplied, the app automatically falls back to reactive LocalStorage state management so team members can preview the entire application immediately.
- **Real-Time PostgreSQL Ready**: Once the environment variables are set, the application operates against your cloud Supabase database.
