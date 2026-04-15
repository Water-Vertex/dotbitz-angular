export interface Assessment {
  id: number;
  question: string;
  answer: string;
  options: string[];          // JSON array from backend
  course_id: number;
  assessment_type: 'mcqs' | 'q-a';
  status: 'active' | 'inactive';
  is_single: boolean;
  due_date?: string;          // Added due_date field (optional for backward compatibility)
  created_at?: string;
  updated_at?: string;
}

// ===== Course Interface =====
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

export interface AssessmentFormData {
  question: string;
  answer: string;
  options?: string[];         // optional for Q&A
  course_id: number;
  assessment_type: 'mcqs' | 'q-a';
  status?: 'active' | 'inactive';
  is_single?: boolean;
  due_date?: string;          // Added due_date field
}

export interface AssessmentListResponse {
  data: Assessment[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  message?: string;
}

// Optional: Add a new interface for Create Assessment Request
export interface CreateAssessmentRequest {
  course_id: number;
  assessment_title: string;
  due_date: string;
  questions: Array<{
    assessment_type: 'mcqs' | 'q-a';
    question: string;
    answer: string;
    marks: number;
    is_single?: boolean;
    options?: string[];
  }>;
}

// Optional: Add a new interface for Assessment Response (for single assessment view)
export interface AssessmentResponse {
  id: number;
  course_id: number;
  assessment_title: string;
  due_date?: string;
  total_marks: number;
  questions: Array<{
    id: number;
    question: string;
    answer: string;
    options: string[];
    assessment_type: 'mcqs' | 'q-a';
    marks: number;
    is_single: boolean;
  }>;
  created_at?: string;
  updated_at?: string;
}
