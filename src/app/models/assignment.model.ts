// ===== Course Interface  =====
export interface Course {
  id: number;
  course_name: string;
  slug: string;
  course_code: string;

  course_description?: string;
  course_duration?: number;
  course_fee?: string | number;
  course_level?: string;
  age_limit?: string;

  start_date?: string;
  end_date?: string;
  status?: string;
  is_featured?: boolean;

  thumbnail_image?: string;
  short_description?: string;
  benefits?: string;

  created_at?: string;
  updated_at?: string;
}

// ===== Assignment Interface =====
export interface Assignment {
  id?: number;

  course_id: number; // FK
  title: string;
  assignment_file?: string; // uploaded file name
  due_date?: string; // assignment due date
  total_marks?: number; // total marks
  uploaded_at?: string; // timestamp when uploaded

  created_at?: string;
  updated_at?: string;
  course?: Course; // relation
}

// ===== Payload (Create / Update) =====
export interface AssignmentPayload {
  course_id: number;
  title: string;
  assignment_file?: File | string; // file for upload
  due_date?: string;
  total_marks?: number;
}

// ===== API Response =====
export interface AssignmentApiResponse {
  success?: boolean;
  message?: string;
  data: Assignment | Assignment[];
}
