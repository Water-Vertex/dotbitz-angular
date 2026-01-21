export interface Instructor {
  id: number;
  instructor_uid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  gender?: string;
  status?: string;
  salary?: string;
  work_experience?: string;
  updated_at?: string;
  created_at?: string;
}

export interface Course {
    id?: number;
    course_name: string;
    slug: string;
    course_code: string;
    course_description?: string;
    course_duration?: number;
    course_fee?: string | number;
    course_level?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    is_featured?: boolean;
    instructor_id: number;   // <-- ID of the instructor
    instructor?: Instructor; // <-- Full instructor object from API
    thumbnail_image?: string;
}

export interface CoursePayload {
    course_name: string;
    course_code: string;
    course_description?: string;
    course_duration?: number;
    course_fee?: string | number;
    course_level?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    is_featured?: boolean;
    instructor_id: number;   // <-- Send only ID to API
    thumbnail_image?: string;
}

export interface CourseApiResponse {
    success: boolean;
    data: Course | Course[];
    message?: string;
}
