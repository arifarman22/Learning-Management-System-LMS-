'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses.api';
import { modulesApi } from '@/lib/api/modules.api';
import { progressApi } from '@/lib/api/progress.api';
import { enrollmentsApi } from '@/lib/api/enrollments.api';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CourseLearnPageProps {
  slug: string;
}

export function CourseLearnPage({ slug }: CourseLearnPageProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lessonStartTime, setLessonStartTime] = useState<number>(Date.now());

  const { data: course } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getBySlug(slug),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', course?.id, user?.id],
    queryFn: () => enrollmentsApi.getAll({ courseId: course?.id, studentId: user?.id }),
    enabled: !!course?.id && !!user?.id,
  });

  const { data: modules } = useQuery({
    queryKey: ['modules', course?.id],
    queryFn: () => modulesApi.getByCourse(course?.id),
    enabled: !!course?.id,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', enrollment?.data?.[0]?.id],
    queryFn: () => progressApi.getEnrollmentProgress(enrollment?.data?.[0]?.id),
    enabled: !!enrollment?.data?.[0]?.id,
  });

  const markCompleteMutation = useMutation({
    mutationFn: ({ enrollmentId, lessonId, timeSpent }: { enrollmentId: string; lessonId: string; timeSpent: number }) =>
      progressApi.markLessonComplete(enrollmentId, { lessonId, timeSpent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment'] });
    },
  });

  const handleLessonComplete = () => {
    if (!selectedLesson || !enrollment?.data?.[0]?.id) return;
    
    const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
    markCompleteMutation.mutate({
      enrollmentId: enrollment.data[0].id,
      lessonId: selectedLesson.id,
      timeSpent,
    });
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.data?.lessons?.some((l: any) => l.lessonId === lessonId && l.completed);
  };

  useEffect(() => {
    if (selectedLesson) {
      setLessonStartTime(Date.now());
    }
  }, [selectedLesson]);

  useEffect(() => {
    if (!selectedLesson && modules?.data && modules.data.length > 0) {
      const firstModule = modules.data[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        const sortedLessons = firstModule.lessons.sort((a: any, b: any) => a.order - b.order);
        setSelectedLesson(sortedLessons[0]);
      }
    }
  }, [modules, selectedLesson]);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!enrollment?.data?.[0]) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to enroll in this course to access the content.</p>
          <Link href="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r overflow-hidden`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900 truncate">{course.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all" 
                style={{ width: `${progress?.data?.progress || 0}%` }} 
              />
            </div>
            <span className="text-sm text-gray-600">{progress?.data?.progress || 0}%</span>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {modules?.data?.map((module: any) => (
            <div key={module.id} className="border-b">
              <div className="p-4 bg-gray-50">
                <h3 className="font-medium text-gray-900">{module.title}</h3>
                {module.description && (
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                )}
              </div>
              {module.lessons?.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => {
                const completed = isLessonCompleted(lesson.id);
                const isActive = selectedLesson?.id === lesson.id;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      isActive ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        completed ? 'bg-green-600 text-white' : 
                        isActive ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {completed ? '✓' : lesson.order}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isActive ? 'text-blue-600' : completed ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {lesson.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="px-2 py-1 bg-gray-100 rounded">{lesson.type}</span>
                          {lesson.duration && <span>{lesson.duration} min</span>}
                          {lesson.isFree && <span className="text-green-600">Free</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">
                {selectedLesson?.title || 'Select a lesson'}
              </h1>
              {selectedLesson && (
                <p className="text-sm text-gray-600">
                  {selectedLesson.type} • {selectedLesson.duration ? `${selectedLesson.duration} min` : 'No duration'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLessonCompleted(selectedLesson?.id) && selectedLesson && (
              <button
                onClick={handleLessonComplete}
                disabled={markCompleteMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition"
              >
                {markCompleteMutation.isPending ? 'Marking...' : 'Mark Complete'}
              </button>
            )}
            <Link
              href="/dashboard"
              className="px-4 py-2 border text-gray-700 text-sm rounded hover:bg-gray-50 transition"
            >
              Exit Course
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedLesson ? (
            <div className="max-w-4xl mx-auto p-6">
              {selectedLesson.type === 'VIDEO' && selectedLesson.videoUrl && (
                <div className="mb-6">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full"
                      src={selectedLesson.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
              
              {selectedLesson.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{selectedLesson.description}</p>
                </div>
              )}
              
              {selectedLesson.content && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Content</h2>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                  </div>
                </div>
              )}
              
              {selectedLesson.type === 'QUIZ' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Quiz</h3>
                  <p className="text-blue-700">Quiz functionality will be implemented here.</p>
                </div>
              )}
              
              {selectedLesson.type === 'ASSIGNMENT' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-900 mb-2">Assignment</h3>
                  <p className="text-orange-700">Assignment submission will be implemented here.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a lesson to start learning</h2>
                <p className="text-gray-600">Choose a lesson from the sidebar to begin.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}