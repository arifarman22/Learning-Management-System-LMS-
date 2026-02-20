import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { coursesApi, CourseFilters, CreateCourseDto, UpdateCourseDto } from '@/lib/api/courses.api';

const QUERY_KEYS = {
  COURSES: 'courses',
  COURSE: 'course',
  INSTRUCTOR_STATS: 'instructor-stats',
};

// Optimized courses list with pagination
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSES, filters],
    queryFn: () => coursesApi.getAll(filters),
    // Keep previous data while fetching new page (smooth pagination)
    placeholderData: keepPreviousData,
    // Only fetch if filters are provided
    enabled: filters !== undefined,
  });
};

// Single course with prefetch capability
export const useCourse = (id: string, prefetch = false) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.COURSE, id],
    queryFn: () => coursesApi.getById(id),
    enabled: !!id && !prefetch,
  });

  // Prefetch function for hover/link interactions
  const prefetchCourse = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.COURSE, courseId],
      queryFn: () => coursesApi.getById(courseId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return { ...query, prefetchCourse };
};

// Course by slug with deduplication
export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE, 'slug', slug],
    queryFn: () => coursesApi.getBySlug(slug),
    enabled: !!slug,
    // Deduplicate requests within 5 seconds
    staleTime: 5000,
  });
};

// Optimistic create with instant UI update
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseDto) => coursesApi.create(data),
    onMutate: async (newCourse) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.COURSES] });

      // Snapshot previous value
      const previousCourses = queryClient.getQueryData([QUERY_KEYS.COURSES]);

      // Optimistically update cache
      queryClient.setQueryData([QUERY_KEYS.COURSES], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [{ id: 'temp-id', ...newCourse }, ...old.data],
          total: old.total + 1,
        };
      });

      return { previousCourses };
    },
    onError: (err, newCourse, context) => {
      // Rollback on error
      if (context?.previousCourses) {
        queryClient.setQueryData([QUERY_KEYS.COURSES], context.previousCourses);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
    },
  });
};

// Optimistic update
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
      coursesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.COURSE, id] });

      const previousCourse = queryClient.getQueryData([QUERY_KEYS.COURSE, id]);

      queryClient.setQueryData([QUERY_KEYS.COURSE, id], (old: any) => ({
        ...old,
        ...data,
      }));

      return { previousCourse };
    },
    onError: (err, { id }, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData([QUERY_KEYS.COURSE, id], context.previousCourse);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, id] });
    },
  });
};

// Optimistic delete
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.COURSES] });

      const previousCourses = queryClient.getQueryData([QUERY_KEYS.COURSES]);

      queryClient.setQueryData([QUERY_KEYS.COURSES], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((course: any) => course.id !== id),
          total: old.total - 1,
        };
      });

      return { previousCourses };
    },
    onError: (err, id, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData([QUERY_KEYS.COURSES], context.previousCourses);
      }
    },
    onSettled: () => {
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

// Instructor stats with longer cache
export const useInstructorStats = (instructorId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_STATS, instructorId],
    queryFn: () => coursesApi.getInstructorStats(instructorId),
    enabled: !!instructorId,
    // Stats change less frequently, cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
};
