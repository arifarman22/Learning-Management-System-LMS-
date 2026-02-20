# 🌐 DEPLOY VIA VERCEL WEBSITE (No CLI Required)

## 📋 STEP-BY-STEP GUIDE

### 🗄️ STEP 1: SETUP DATABASE

**Option A: Vercel Postgres (Easiest)**
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Name it: `lms-database`
5. Click "Create"
6. Copy the `POSTGRES_PRISMA_URL` - you'll need this

**Option B: Supabase (Free)**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" (URI format)

---

### 🔧 STEP 2: DEPLOY BACKEND

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Click "Import Project"

2. **Import from GitHub**
   - Select your repository: `Learning-Management-System-LMS-`
   - Click "Import"

3. **Configure Backend Project**
   ```
   Project Name: lms-backend
   Framework Preset: Other
   Root Directory: backend
   Build Command: npm run vercel-build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables** (Click "Environment Variables")
   ```
   DATABASE_URL = postgresql://user:pass@host:5432/dbname
   JWT_ACCESS_SECRET = <click "Generate" or paste 32-char secret>
   JWT_REFRESH_SECRET = <click "Generate" or paste different 32-char secret>
   JWT_ACCESS_EXPIRATION = 15m
   JWT_REFRESH_EXPIRATION = 7d
   NODE_ENV = production
   PORT = 3001
   CORS_ORIGIN = https://your-frontend.vercel.app
   RATE_LIMIT_WINDOW_MS = 900000
   RATE_LIMIT_MAX_REQUESTS = 100
   LOG_LEVEL = info
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your backend URL: `https://lms-backend-xxx.vercel.app`

---

### 🎨 STEP 3: DEPLOY FRONTEND

1. **Import Again**
   - Go to https://vercel.com/new
   - Select same repository
   - Click "Import"

2. **Configure Frontend Project**
   ```
   Project Name: lms-frontend
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL = https://lms-backend-xxx.vercel.app/api
   NEXT_PUBLIC_ENV = production
   ```
   (Replace `lms-backend-xxx` with your actual backend URL from Step 2)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your frontend URL: `https://lms-frontend-xxx.vercel.app`

---

### 🔄 STEP 4: UPDATE BACKEND CORS

1. Go to backend project in Vercel Dashboard
2. Settings → Environment Variables
3. Find `CORS_ORIGIN`
4. Update value to: `https://lms-frontend-xxx.vercel.app`
5. Click "Save"
6. Go to "Deployments" tab
7. Click "..." on latest deployment → "Redeploy"

---

### 🗃️ STEP 5: RUN DATABASE MIGRATIONS

**Option A: Using Vercel CLI (Recommended)**
```bash
npm i -g vercel
cd backend
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Manual SQL (If no CLI)**
1. Connect to your database using a SQL client
2. Run the SQL from `prisma/migrations/` folder manually
3. Run seed queries manually

---

### ✅ STEP 6: VERIFY DEPLOYMENT

1. **Test Backend**
   - Visit: `https://lms-backend-xxx.vercel.app/health`
   - Should see: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**
   - Visit: `https://lms-frontend-xxx.vercel.app`
   - Try login with:
     - Email: `student@lms.com`
     - Password: `Student123!`

---

## 🎯 QUICK REFERENCE

### Backend Configuration
```
Root Directory: backend
Build Command: npm run vercel-build
Output Directory: dist
```

### Frontend Configuration
```
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
```

### Required Environment Variables

**Backend:**
- `DATABASE_URL` (from your database provider)
- `JWT_ACCESS_SECRET` (32+ characters)
- `JWT_REFRESH_SECRET` (32+ characters)
- `CORS_ORIGIN` (your frontend URL)
- `NODE_ENV=production`

**Frontend:**
- `NEXT_PUBLIC_API_URL` (your backend URL + /api)
- `NEXT_PUBLIC_ENV=production`

---

## 🔐 GENERATE JWT SECRETS

**Online Generator:**
1. Visit: https://generate-secret.vercel.app/32
2. Copy the generated secret
3. Generate twice (one for access, one for refresh)

**Or use this format:**
```
JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

---

## 🚨 TROUBLESHOOTING

### Build Failed
- Check "Build Logs" in Vercel Dashboard
- Ensure `Root Directory` is set correctly
- Verify all dependencies in package.json

### Database Connection Error
- Ensure `DATABASE_URL` format is correct
- Add `?sslmode=require` at the end if needed
- Check database is accessible from Vercel

### CORS Error
- Ensure `CORS_ORIGIN` matches frontend URL exactly
- No trailing slash
- Must include `https://`

### 404 on API Routes
- Verify backend URL in frontend env
- Check `/api` is appended to backend URL
- Ensure backend deployed successfully

---

## 📊 DEPLOYMENT CHECKLIST

Before going live:

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Database connected
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Database migrations run
- [ ] Test login works
- [ ] Health check returns OK

---

## 🎉 YOU'RE DONE!

Your LMS is now live on Vercel!

**Access your app:**
- Frontend: `https://lms-frontend-xxx.vercel.app`
- Backend API: `https://lms-backend-xxx.vercel.app/api`

**Test Accounts:**
- Student: `student@lms.com` / `Student123!`
- Instructor: `instructor@lms.com` / `Instructor123!`
- Admin: `admin@lms.com` / `Admin123!`
- Super Admin: `superadmin@lms.com` / `SuperAdmin123!`

---

## 🔄 AUTO-DEPLOYMENTS

Vercel automatically deploys when you push to GitHub:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

Configure in: Vercel Dashboard → Settings → Git

---

## 💡 TIPS

1. **Custom Domain**: Settings → Domains → Add
2. **View Logs**: Deployments → Click deployment → View Function Logs
3. **Rollback**: Deployments → Previous deployment → Promote to Production
4. **Environment Variables**: Can be different for Production/Preview/Development

---

**Need help?** Check Vercel docs: https://vercel.com/docs