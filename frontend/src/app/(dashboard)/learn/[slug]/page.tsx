import { CourseLearnPage } from '@/components/courses/CourseLearnPage';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function LearnPage({ params }: PageProps) {
  return <CourseLearnPage slug={params.slug} />;
}