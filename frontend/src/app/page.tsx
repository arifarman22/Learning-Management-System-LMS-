'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Star,
  Users,
  Award,
  Zap,
  CheckCircle,
  PlayCircle,
  ArrowRight,
  Monitor,
  Database,
  Code
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              L
            </div>
            <span className="text-xl font-bold tracking-tight">InsightFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors text-white/70">
              Log in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <motion.div
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8">
            <Zap size={14} />
            <span>Next Generation Learning Management System</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Master Your Future <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              With Precision.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-12 leading-relaxed">
            Experience an advanced Learning Management System designed for the modern era.
            Interactive courses, real-time tracking, and verified certifications.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-white/90 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <a
              href="#courses"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              Browse Courses
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-12">
            {[
              { label: 'Active Students', value: '10k+' },
              { label: 'Pro Courses', value: '250+' },
              { label: 'Top Instructors', value: '80+' },
              { label: 'Course Completion', value: '94%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Accelerate Your Core Skills</h2>
              <p className="text-lg text-white/50 max-w-xl">
                Hands-on projects and deep dives into the technologies that shape the digital world.
              </p>
            </div>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 group transition-all">
              View all courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Introduction to TypeScript',
                level: 'Beginner',
                thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
                icon: <Code className="text-blue-400" />,
                duration: '12h 45m'
              },
              {
                title: 'Advanced Next.js Patterns',
                level: 'Advanced',
                thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&q=80',
                icon: <Monitor className="text-purple-400" />,
                duration: '18h 20m'
              },
              {
                title: 'Modern Backend with Node',
                level: 'Intermediate',
                thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
                icon: <Database className="text-green-400" />,
                duration: '15h 10m'
              }
            ].map((course, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all shadow-2xl"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                      <PlayCircle size={32} />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      {course.icon}
                    </div>
                    <span className="text-xs text-white/40">{course.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#0a0a0a]" />
                      ))}
                      <span className="ml-4 text-[10px] text-white/40 flex items-center">+4k students</span>
                    </div>
                    <Link href={`/login`} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-6xl font-black mb-6 tracking-tighter italic">DESIGNED FOR EXCELLENCE</h2>
            <p className="text-white/40 max-w-lg mx-auto uppercase tracking-[0.2em] text-xs font-bold">
              The tools you need to build the future you want.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="text-yellow-400" />,
                title: 'Real-time Analytics',
                desc: 'Track your progress with precision and insightful data visualizations.'
              },
              {
                icon: <BookOpen className="text-blue-400" />,
                title: 'Interactive Labs',
                desc: 'Learn by doing with our embedded code editors and sandboxes.'
              },
              {
                icon: <Users className="text-purple-400" />,
                title: 'Community First',
                desc: 'Connect with peers and industry experts in dedicated study groups.'
              },
              {
                icon: <Award className="text-orange-400" />,
                title: 'Verified Certificates',
                desc: 'Showcase your skills with blockchain-verified industry certifications.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                L
              </div>
              <span className="text-xl font-bold tracking-tight">InsightFlow</span>
            </div>
            <p className="text-white/40 max-w-xs text-sm">
              Empowering the next generation of digital creators through precision education.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 lg:gap-24">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center md:text-left">
          <p className="text-xs text-white/30">
            © 2026 InsightFlow LMS. Built for the future of education.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
