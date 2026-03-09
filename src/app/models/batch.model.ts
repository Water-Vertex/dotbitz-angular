import { Course } from "./course.model";
import { Instructor } from "./instructor.model";

export interface Batch {
  id?: number;
  name: string;
  slug: string;

  course_id: number;
  instructor_id: number;

  start_date?: string;
  end_date?: string;
  description?: string;

  students?: number;   // total enrolled students count
  status?: string;

  // Relationships (if coming from API)
  course?: Course;
  instructor?: Instructor;

  created_at?: string;
  updated_at?: string;
}

export interface BatchPayload {
  name: string;
  course_id: number;
  instructor_id: number;

  start_date?: string;
  end_date?: string;
  description?: string;

  students?: number;
  status?: string;
}

export interface BatchApiResponse {
  success: boolean;
  data: Batch | Batch[];
  message?: string;
}
