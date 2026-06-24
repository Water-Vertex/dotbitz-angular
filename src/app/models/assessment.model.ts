export interface Assessment {
  id: number;
  question: string;
  answer: string;
  options: string[];          // JSON array from backend
  course_id: number;
  assessment_type: 'mcqs' | 'q-a';
  status: 'active' | 'inactive';
  is_single: boolean;
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
// ===== Assessment Result Interfaces =====

export interface AnswerDetail {
  question_id: number;
  question: string;
  assessment_type: string;
  options: string[];
  correct_answer: string | null;
  student_answer: string;
  is_correct: boolean;
  marks: number;
}

export interface ResultItem {
  attempt_id: number;
  assign_assessment_id: number;
  assessment_title: string;
  course_name: string;
  total_marks: number;
  obtain_marks: number | null;
  remarks: string | null;
  status: string;
  answers?: AnswerDetail[];
}

// Optional: Response wrapper agar aap use karna chahen
export interface AssessmentResultResponse {
  success: boolean;
  data: ResultItem[];
  message?: string;
}
