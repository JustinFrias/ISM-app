# 🔐 Clerk Authentication Setup Guide for SkeuoVault

This guide helps you set up secure user authentication and role-based access control with **Clerk**.

---

## 🚀 Step 1: Create a Clerk Application

1. Go to [https://clerk.com](https://clerk.com) and sign in (or create an account).
2. Click **Add application**.
3. Enter your application name (e.g. `SkeuoVault Inventory`).
4. Select your preferred sign-in options (e.g. **Email**, **Google**, **GitHub**).
5. Click **Create application**.

---

## 🔑 Step 2: Copy Your Publishable Key

1. In your Clerk Dashboard, navigate to **API Keys** in the left sidebar.
2. Copy your **Publishable key** (it looks like `pk_test_...` or `pk_live_...`).
3. Open your `.env` file in the root of the project and add:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   ```

---

## 👑 Step 3: Assign User Roles (Admin vs. Staff)

By default, any user signing in will be assigned the `STAFF` role. To make a user an **ADMIN**:

1. In the Clerk Dashboard, go to **Users** in the left sidebar.
2. Click on the user you want to make an Admin.
3. Scroll down to the **Metadata** section.
4. Click **Edit** next to **Public metadata** (or **Unsafe metadata**) and enter:
   ```json
   {
     "role": "ADMIN"
   }
   ```
5. Click **Save**.
6. The user will immediately have full access to Admin Dashboards, Financial Reports, Categories, and User Management upon sign-in.

---

## 🌐 Step 4: Add Clerk Key to Vercel for Production

When deploying to Vercel:
1. Go to your project in **Vercel** -> **Settings** -> **Environment Variables**.
2. Add a new variable:
   - **Key**: `VITE_CLERK_PUBLISHABLE_KEY`
   - **Value**: `pk_live_...` (or `pk_test_...`)
3. Trigger a redeploy to activate Clerk authentication live.
