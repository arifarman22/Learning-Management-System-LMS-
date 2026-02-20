# LMS Production Setup Script

echo "🚀 Setting up LMS for Production..."

# Backend Setup
echo "\n📦 Installing Backend Dependencies..."
cd backend
npm install

echo "\n🔐 Generating Prisma Client..."
npx prisma generate

echo "\n🗄️  Running Database Migrations..."
npx prisma migrate deploy

echo "\n🌱 Seeding Database (optional)..."
# npx prisma db seed

echo "\n🏗️  Building Backend..."
npm run build

# Frontend Setup
echo "\n📦 Installing Frontend Dependencies..."
cd ../frontend
npm install

echo "\n🏗️  Building Frontend..."
npm run build

echo "\n✅ Setup Complete!"
echo "\n📝 Next Steps:"
echo "1. Update .env files with production values"
echo "2. Generate JWT secrets: openssl rand -base64 32"
echo "3. Configure DATABASE_URL with production database"
echo "4. Test locally: npm run dev (in both backend and frontend)"
echo "5. Deploy to Vercel: vercel --prod"
