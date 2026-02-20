# ✅ VERCEL DEPLOYMENT CHECKLIST

## 🎯 BEFORE YOU START

- [ ] GitHub repository is public or connected to Vercel
- [ ] Have a database ready (Vercel Postgres, Supabase, or Railway)
- [ ] Vercel account created (https://vercel.com)

---

## 📝 DEPLOYMENT STEPS

### 1️⃣ DEPLOY BACKEND

- [ ] Go to https://vercel.com/new
- [ ] Import your GitHub repository
- [ ] Configure:
  - Project Name: `lms-backend`
  - Root Directory: `backend`
  - Build Command: `npm run vercel-build`
  - Output Directory: `dist`
- [ ] Add Environment Variables:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_ACCESS_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `CORS_ORIGIN` (leave as placeholder for now)
  - [ ] `NODE_ENV=production`
- [ ] Click Deploy
- [ ] Copy backend URL: `_______________________`

### 2️⃣ DEPLOY FRONTEND

- [ ] Go to https://vercel.com/new again
- [ ] Import same repository
- [ ] Configure:
  - Project Name: `lms-frontend`
  - Root Directory: `frontend`
  - Framework: `Next.js`
- [ ] Add Environment Variables:
  - [ ] `NEXT_PUBLIC_API_URL` = `<backend-url>/api`
  - [ ] `NEXT_PUBLIC_ENV=production`
- [ ] Click Deploy
- [ ] Copy frontend URL: `_______________________`

### 3️⃣ UPDATE BACKEND CORS

- [ ] Go to backend project → Settings → Environment Variables
- [ ] Update `CORS_ORIGIN` to frontend URL
- [ ] Redeploy backend

### 4️⃣ DATABASE SETUP

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run migrations:
  ```bash
  cd backend
  vercel env pull
  npx prisma migrate deploy
  npx prisma db seed
  ```

### 5️⃣ VERIFY

- [ ] Backend health: `<backend-url>/health` returns OK
- [ ] Frontend loads: `<frontend-url>` shows login page
- [ ] Login works: Try `student@lms.com` / `Student123!`

---

## 🔑 ENVIRONMENT VARIABLES REFERENCE

### Backend (lms-backend)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_ACCESS_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://lms-frontend-xxx.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend (lms-frontend)
```
NEXT_PUBLIC_API_URL=https://lms-backend-xxx.vercel.app/api
NEXT_PUBLIC_ENV=production
```

---

## 🎉 DEPLOYMENT COMPLETE!

**Your URLs:**
- Frontend: `https://lms-frontend-xxx.vercel.app`
- Backend: `https://lms-backend-xxx.vercel.app`

**Test Accounts:**
- Student: `student@lms.com` / `Student123!`
- Instructor: `instructor@lms.com` / `Instructor123!`
- Admin: `admin@lms.com` / `Admin123!`
- Super Admin: `superadmin@lms.com` / `SuperAdmin123!`

---

## 📞 NEED HELP?

- Full Guide: See `DEPLOY_VIA_WEBSITE.md`
- Vercel Docs: https://vercel.com/docs
- Issues: Check deployment logs in Vercel Dashboard