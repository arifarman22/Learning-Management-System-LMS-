#!/bin/bash

echo "🚀 LMS Vercel Deployment Script"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo ""
echo "📋 DEPLOYMENT CHECKLIST:"
echo "========================"
echo ""
echo "Before deploying, ensure you have:"
echo "✓ PostgreSQL database URL ready"
echo "✓ Generated JWT secrets (openssl rand -base64 32)"
echo "✓ Vercel account created"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "🗄️  STEP 1: Deploy Backend"
echo "=========================="
cd backend
echo "Deploying backend to Vercel..."
vercel --prod

echo ""
echo "📝 Copy your backend URL from above"
read -p "Enter backend URL (e.g., https://lms-backend.vercel.app): " BACKEND_URL

echo ""
echo "🎨 STEP 2: Deploy Frontend"
echo "=========================="
cd ../frontend

# Update frontend env
echo "NEXT_PUBLIC_API_URL=${BACKEND_URL}/api" > .env.production
echo "NEXT_PUBLIC_ENV=production" >> .env.production

echo "Deploying frontend to Vercel..."
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Go to Vercel Dashboard"
echo "2. Add environment variables to backend:"
echo "   - DATABASE_URL"
echo "   - JWT_ACCESS_SECRET"
echo "   - JWT_REFRESH_SECRET"
echo "   - CORS_ORIGIN (your frontend URL)"
echo ""
echo "3. Run database migrations:"
echo "   cd backend"
echo "   vercel env pull"
echo "   npx prisma migrate deploy"
echo "   npx prisma db seed"
echo ""
echo "4. Test your deployment:"
echo "   Backend: ${BACKEND_URL}/health"
echo "   Frontend: Check Vercel dashboard for URL"
echo ""
echo "🎉 Happy deploying!"