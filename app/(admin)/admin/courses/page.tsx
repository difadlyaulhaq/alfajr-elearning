import CourseManagement from '@/components/admin/CourseManagement';
import { getAllCourses } from '@/lib/data/courses';
import { getAllCategories } from '@/lib/data/categories';

export default async function CoursesPage() {
  // Fetch data on the server
  const courses = await getAllCourses();
  const categories = await getAllCategories();

  // Pass initial data to the client component
  return <CourseManagement initialCourses={courses} initialCategories={categories} />;
}