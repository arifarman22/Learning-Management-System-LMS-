# 🌐 DEPLOY FROM VERCEL WEBSITE - EXACT STEPS

## 🎯 STEP 1: SETUP DATABASE (5 minutes)

### Get Free PostgreSQL Database

**Option A: Vercel Postgres (Easiest)**
1. Go to: https://vercel.com/dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name: `lms-database`
6. Click "Create"
7. Click "Connect" → Copy `POSTGRES_PRISMA_URL`
8. Save it: `_________________________________`

**Option B: Supabase (Alternative)**
1. Go to: https://supabase.com
2. Click "New Project"
3. Name: `lms-database`
4. Create project
5. Go to Settings → Database
6. Copy "Connection string" (URI format)
7. Save it: `_________________________________`

---

## 🔧 STEP 2: DEPLOY BACKEND (10 minutes)

### 2.1 Import Project

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `Learning-Management-System-LMS-`
4. Click "Import"

### 2.2 Configure Backend

**Project Settings:**
```
Project Name: lms-backend
Framework Preset: Other
Root Directory: backend
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
```

### 2.3 Add Environment Variables

Click "Environment Variables" and add these **ONE BY ONE**:

```
Name: DATABASE_URL
Value: [Paste your database URL from Step 1]
Environment: Production

Name: JWT_ACCESS_SECRET
Value: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Environment: Production

Name: JWT_REFRESH_SECRET
Value: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4
Environment: Production

Name: JWT_ACCESS_EXPIRATION
Value: 15m
Environment: Production

Name: JWT_REFRESH_EXPIRATION
Value: 7d
Environment: Production

Name: NODE_ENV
Value: production
Environment: Production

Name: CORS_ORIGIN
Value: https://placeholder.com
Environment: Production
(We'll update this after frontend deployment)

Name: RATE_LIMIT_WINDOW_MS
Value: 900000
Environment: Production

Name: RATE_LIMIT_MAX_REQUESTS
Value: 100
Environment: Production

Name: LOG_LEVEL
Value: info
Environment: Production
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait 3-5 minutes
3. Once deployed, copy your backend URL
4. Save it: `https://lms-backend-____________.vercel.app`

---

## 🎨 STEP 3: DEPLOY FRONTEND (5 minutes)

### 3.1 Import Project Again

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `Learning-Management-System-LMS-` (same repo)
4. Click "Import"

### 3.2 Configure Frontend

**Project Settings:**
```
Project Name: lms-frontend
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3.3 Add Environment Variables

Click "Environment Variables" and add:

```
Name: NEXT_PUBLIC_API_URL
Value: https://lms-backend-____________.vercel.app/api
(Replace with YOUR backend URL from Step 2.4)
Environment: Production

Name: NEXT_PUBLIC_ENV
Value: production
Environment: Production
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Once deployed, copy your frontend URL
4. Save it: `https://lms-frontend-____________.vercel.app`

---

## 🔄 STEP 4: UPDATE BACKEND CORS (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click on "lms-backend" project
3. Click "Settings" tab
4. Click "Environment Variables"
5. Find `CORS_ORIGIN`
6. Click "Edit"
7. Change value to: `https://lms-frontend-____________.vercel.app`
   (Your frontend URL from Step 3.4)
8. Click "Save"
9. Go to "Deployments" tab
10. Click "..." on latest deployment
11. Click "Redeploy"
12. Click "Redeploy" to confirm

---

## 🗃️ STEP 5: SETUP DATABASE (5 minutes)

### 5.1 Install Vercel CLI

Open terminal/command prompt:
```bash
npm i -g vercel
```

### 5.2 Login to Vercel

```bash
vercel login
```

### 5.3 Pull Environment Variables

```bash
cd backend
vercel link
```

Select:
- Scope: Your account
- Link to existing project: Y
- Project name: lms-backend

```bash
vercel env pull .env.production
```

### 5.4 Run Migrations

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## ✅ STEP 6: TEST DEPLOYMENT (2 minutes)

### Test Backend

Open browser and visit:
```
https://lms-backend-____________.vercel.app/health
```

Should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Test Frontend

1. Visit: `https://lms-frontend-____________.vercel.app`
2. Click "Login"
3. Enter:
   - Email: `student@lms.com`
   - Password: `Student123!`
4. Click "Login"
5. Should see student dashboard ✅

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Live URLs

```
Frontend: https://lms-frontend-____________.vercel.app
Backend:  https://lms-backend-____________.vercel.app
```

### Test Accounts

```
Student:     student@lms.com / Student123!
Instructor:  instructor@lms.com / Instructor123!
Admin:       admin@lms.com / Admin123!
Super Admin: superadmin@lms.com / SuperAdmin123!
```

---

## 🚨 TROUBLESHOOTING

### Backend Build Failed

1. Go to Vercel Dashboard → lms-backend
2. Click "Deployments" → Latest deployment
3. Click "View Function Logs"
4. Check error message
5. Common fix: Verify DATABASE_URL is correct

### Frontend Shows 500 Error

1. Check backend is deployed successfully
2. Verify NEXT_PUBLIC_API_URL is correct
3. Check CORS_ORIGIN in backend matches frontend URL

### Database Connection Error

1. Ensure DATABASE_URL format is correct
2. For production databases, add `?sslmode=require` at the end
3. Example: `postgresql://user:pass@host:5432/db?sslmode=require`

### CORS Error in Browser

1. Go to backend project → Settings → Environment Variables
2. Update CORS_ORIGIN to exact frontend URL
3. No trailing slash
4. Redeploy backend

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Database created and URL copied
- [ ] Backend deployed with all environment variables
- [ ] Frontend deployed with API URL
- [ ] CORS_ORIGIN updated in backend
- [ ] Backend redeployed after CORS update
- [ ] Database migrations run
- [ ] Database seeded with test data
- [ ] Backend health check returns OK
- [ ] Frontend loads successfully
- [ ] Login works with test account

---

## 💡 NEXT STEPS

1. **Custom Domain** (Optional)
   - Go to project → Settings → Domains
   - Add your domain

2. **Auto-Deploy**
   - Already enabled! Push to GitHub = auto deploy

3. **Monitor**
   - Check logs: Deployments → View Function Logs
   - Enable Analytics: Settings → Analytics

---

**🎊 Your LMS is now LIVE on Vercel!**