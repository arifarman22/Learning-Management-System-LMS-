import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, CourseFilters, CreateCourseDto, UpdateCourseDto } from '@/lib/api/courses.api';
import { Course } from '@/types';

const QUERY_KEYS = {
  COURSES: 'courses',
  COURSE: 'course',
  INSTRUCTOR_STATS: 'instructor-stats',
};

export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSES, filters],
    queryFn: () => coursesApi.getAll(filters),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE, id],
    queryFn: () => coursesApi.getById(id),
    enabled: !!id,
  });
};

export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE, 'slug', slug],
    queryFn: () => coursesApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseDto) => coursesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
      coursesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, variables.id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
    },
  });
};

export const useChangeCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      coursesApi.changeStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, variables.id] });
    },
  });
};

export const useInstructorStats = (instructorId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_STATS, instructorId],
    queryFn: () => coursesApi.getInstructorStats(instructorId),
    enabled: !!instructorId,
  });
};
