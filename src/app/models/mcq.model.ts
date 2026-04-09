
export interface Course {
    id?: number;
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
}
export interface Mcq {
  id?: number;
  question: string;
  answer: string;
  options: string[];
  course_id: number;
  status: 'active' | 'inactive';
  issingle: boolean;
  marks: string,
  course?: Course; // Relation - full course object
  created_at?: string;
  updated_at?: string;
}
