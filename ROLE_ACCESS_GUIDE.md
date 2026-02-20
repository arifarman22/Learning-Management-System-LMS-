# Role-Based Access Guide

## Test Accounts

### 1. SUPER ADMIN
- **Email**: `superadmin@lms.com`
- **Password**: `SuperAdmin123!`
- **Access**: Full system access, analytics, user management, all courses

### 2. ADMIN
- **Email**: `admin@lms.com`
- **Password**: `Admin123!`
- **Access**: Platform management, analytics, user management

### 3. INSTRUCTOR
- **Email**: `instructor@lms.com`
- **Password**: `Instructor123!`
- **Access**: Own courses, student enrollments, course creation

### 4. STUDENT
- **Email**: `student@lms.com`
- **Password**: `Student123!`
- **Access**: Enrolled courses, course browsing, progress tracking

---

## Demo Courses Available

**All users (including newly registered) can see these courses:**

1. **React Masterclass** - $79.99 (Intermediate)
2. **Node.js Complete Guide** - $59.99 (Beginner)  
3. **TypeScript Pro** - $89.99 (Advanced)

> 💡 **Note**: These courses are visible to everyone, including users who register through the registration form. No special credentials needed!

---

## How to Test Role-Based Access

### Step 1: Login as Different Roles
1. Go to `http://localhost:3000/login`
2. Use any of the test accounts above
3. Each role will see a different dashboard

### Step 2: Test Student Features
- Login as: `student@lms.com`
- Browse available courses
- Enroll in courses
- Track progress

### Step 3: Test Instructor Features
- Login as: `instructor@lms.com`
- Create new courses
- Manage course content
- View student enrollments

### Step 4: Test Admin Features
- Login as: `admin@lms.com` or `superadmin@lms.com`
- Access `/analytics` for system metrics
- Access `/users` for user management
- View all courses and enrollments

---

## Protected Routes

### Public Routes
- `/` - Home
- `/login` - Login page
- `/register` - Registration

### Student Routes
- `/dashboard` - Student dashboard
- `/courses` - Browse courses
- `/enrollments` - My enrollments

### Instructor Routes
- `/dashboard` - Instructor dashboard
- `/courses/new` - Create course
- `/courses/:id/edit` - Edit own courses

### Admin Routes (Admin + Super Admin)
- `/analytics` - System analytics
- `/users` - User management
- All instructor and student routes

---

## Frontend Changes Made

### Minimalistic Design
- Clean, modern interface
- Reduced visual clutter
- Better spacing and typography
- Subtle borders instead of heavy shadows
- Gray-900 buttons instead of blue

### Student Dashboard
- Personalized welcome message
- Course progress cards
- Clean course grid
- Simple enrollment flow

---

## How Middleware Works

The middleware (`src/middleware.ts`) checks:
1. **Cookies** for authentication (accessToken + user)
2. **User role** for route access
3. **Redirects** unauthorized users to login
4. **Redirects** authenticated users away from auth pages

---

## Quick Start

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Then visit: `http://localhost:3000/login`
