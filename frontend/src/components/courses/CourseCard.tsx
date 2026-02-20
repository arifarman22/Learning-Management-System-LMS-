'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Course } from '@/types';
import { Clock, Users, BookOpen, Star, ChevronRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onCourseClick?: (courseId: string) => void;
}

export const CourseCard = memo(({ course, onCourseClick }: CourseCardProps) => {
  const handleClick = () => {
    if (onCourseClick) {
      onCourseClick(course.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {course.thumbnail ? (
          <OptimizedImage
            src={course.thumbnail}
            alt={course.title}
            fill
            className="group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <BookOpen size={48} className="text-blue-200" />
          </div>
        )}

        {/* Badge Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
            {course.level}
          </span>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronRight size={24} className="text-blue-600 ml-1" />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            (4.8 • Premium Course)
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors tracking-tight">
          {course.title}
        </h3>

        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">
          {course.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span className="text-[11px] font-bold">{course.enrollmentCount || '4.2k'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="text-[11px] font-bold">12h 45m</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-blue-600">${Number(course.price).toFixed(2)}</span>
          </div>
        </div>

        {/* Instructor Info (Subtle) */}
        {course.instructor && (
          <div className="mt-6 flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-600">
              {course.instructor.firstName[0]}{course.instructor.lastName[0]}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Instructor</p>
              <p className="text-xs font-bold text-gray-700">
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return prevProps.course.id === nextProps.course.id &&
    prevProps.course.title === nextProps.course.title &&
    prevProps.course.price === nextProps.course.price &&
    prevProps.course.thumbnail === nextProps.course.thumbnail;
});

CourseCard.displayName = 'CourseCard';
