'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from './CourseCard';
import { Course } from '@/types';
import { BookOpen } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  loading?: boolean;
}

export const CourseList = memo(({ courses, loading }: CourseListProps) => {
  const renderCourse = useCallback((course: Course) => (
    <CourseCard key={course.id} course={course} />
  ), []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-2 animate-pulse">
            <div className="aspect-[16/10] bg-gray-100 rounded-[1.8rem] mb-6"></div>
            <div className="p-5 space-y-4">
              <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
              <div className="h-6 bg-gray-100 rounded-full w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-full w-full"></div>
              <div className="pt-6 border-t border-gray-50 flex justify-between">
                <div className="h-4 bg-gray-100 rounded-full w-1/3"></div>
                <div className="h-6 bg-gray-100 rounded-full w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
        <p className="text-gray-500 max-w-sm">
          We couldn't find any courses matching your criteria. Try adjusting your filters or browse our popular categories.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {courses.map((course) => (
        <motion.div
          key={course.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {renderCourse(course)}
        </motion.div>
      ))}
    </motion.div>
  );
});

CourseList.displayName = 'CourseList';
