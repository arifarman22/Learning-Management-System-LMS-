import { PrismaClient, Role, CourseStatus, CourseLevel } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Create users
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@lms.com' },
    update: {},
    create: {
      email: 'superadmin@lms.com',
      passwordHash: await hash('SuperAdmin123!'),
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      passwordHash: await hash('Admin123!'),
      firstName: 'Platform',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@lms.com' },
    update: {},
    create: {
      email: 'instructor@lms.com',
      passwordHash: await hash('Instructor123!'),
      firstName: 'John',
      lastName: 'Instructor',
      role: Role.INSTRUCTOR,
      isActive: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@lms.com' },
    update: {},
    create: {
      email: 'student@lms.com',
      passwordHash: await hash('Student123!'),
      firstName: 'Jane',
      lastName: 'Student',
      role: Role.STUDENT,
      isActive: true,
    },
  });

  // Create category
  const category = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Learn web development technologies',
    },
  });

  // Create a sample course
  const course = await prisma.course.upsert({
    where: { slug: 'intro-to-typescript' },
    update: {},
    create: {
      title: 'Introduction to TypeScript',
      slug: 'intro-to-typescript',
      description: 'Learn TypeScript from scratch with practical examples and real-world projects.',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
      instructorId: instructor.id,
      categoryId: category.id,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.BEGINNER,
      price: 49.99,
      publishedAt: new Date(),
    },
  });

  await prisma.course.upsert({
    where: { slug: 'advanced-nextjs' },
    update: {},
    create: {
      title: 'Advanced Next.js Patterns',
      slug: 'advanced-nextjs',
      description: 'Master the power of Next.js with advanced patterns like ISR, Server Actions, and Parallel Routes.',
      thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&q=80',
      instructorId: instructor.id,
      categoryId: category.id,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.ADVANCED,
      price: 99.99,
      publishedAt: new Date(),
    },
  });

  await prisma.course.upsert({
    where: { slug: 'modern-backend-node' },
    update: {},
    create: {
      title: 'Modern Backend with Node.js',
      slug: 'modern-backend-node',
      description: 'Build scalable and secure backends using Node.js, Express, and PostgreSQL.',
      thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
      instructorId: instructor.id,
      categoryId: category.id,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      price: 79.99,
      publishedAt: new Date(),
    },
  });

  await prisma.course.upsert({
    where: { slug: 'creative-ui-tailwind' },
    update: {},
    create: {
      title: 'Creative UI Design with Tailwind',
      slug: 'creative-ui-tailwind',
      description: 'Design beautiful, responsive, and accessible user interfaces using Tailwind CSS.',
      thumbnail: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
      instructorId: instructor.id,
      categoryId: category.id,
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.ALL_LEVELS,
      price: 59.99,
      publishedAt: new Date(),
    },
  });

  // Create a module
  const module1 = await prisma.module.upsert({
    where: { courseId_order: { courseId: course.id, order: 1 } },
    update: {},
    create: {
      courseId: course.id,
      title: 'Getting Started',
      description: 'Introduction to TypeScript basics',
      order: 1,
    },
  });

  // Create lessons
  await prisma.lesson.upsert({
    where: { moduleId_order: { moduleId: module1.id, order: 1 } },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'What is TypeScript?',
      type: 'READING',
      order: 1,
      content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
      isFree: true,
      estimatedTime: 10,
    },
  });

  await prisma.lesson.upsert({
    where: { moduleId_order: { moduleId: module1.id, order: 2 } },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Setting Up Your Environment',
      type: 'VIDEO',
      order: 2,
      content: 'Install Node.js, npm, and TypeScript compiler.',
      isFree: false,
      estimatedTime: 15,
    },
  });

  console.log('✅ Seed complete!');
  console.log('Test accounts:');
  console.log('  superadmin@lms.com / SuperAdmin123!');
  console.log('  admin@lms.com / Admin123!');
  console.log('  instructor@lms.com / Instructor123!');
  console.log('  student@lms.com / Student123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
