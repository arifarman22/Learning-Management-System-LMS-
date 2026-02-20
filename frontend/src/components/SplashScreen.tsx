'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 animate-fade-in">
      <div className="text-center">
        <div className="mb-8 animate-bounce">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in-up">LMS Platform</h1>
        <p className="text-blue-100 text-lg animate-fade-in-up animation-delay-200">Learning Management System</p>
        <div className="mt-8 flex justify-center">
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
