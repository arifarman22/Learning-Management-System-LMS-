'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { NotificationCenter } from '@/components/shared/NotificationCenter';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isStudent = user?.role === Role.STUDENT;
  const isInstructor = user?.role === Role.INSTRUCTOR;
  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT] },
    { href: '/enrollments', label: 'My Learning', icon: '📚', roles: [Role.STUDENT] },
    { href: '/courses', label: 'Browse Courses', icon: '🔍', roles: [Role.STUDENT] },
    { href: '/profile', label: 'My Profile', icon: '👤', roles: [Role.STUDENT] },
    { href: '/courses', label: 'Courses', icon: '📖', roles: [Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN] },
    { href: '/enrollments', label: 'Enrollments', icon: '👥', roles: [Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN] },
    { href: '/users', label: 'Users', icon: '👥', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { href: '/analytics', label: 'Analytics', icon: '📊', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
  ].filter((link) => user && link.roles.includes(user.role));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                🎓 LMS
              </Link>
              {isStudent && (
                <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
                  <span>Welcome back,</span>
                  <span className="font-medium text-gray-900">{user?.firstName}!</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {isStudent && <NotificationCenter />}
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
                
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-blue-600">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {isStudent && (
            <div className="p-4 border-t mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🚀 Keep Learning!</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You're doing great! Continue your learning journey.
                </p>
                <Link 
                  href="/courses"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Explore Courses →
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
