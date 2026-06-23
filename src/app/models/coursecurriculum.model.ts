// // course-curriculum.model.ts

// // ===== Course Interface =====
// export interface Course {
//   id: number;
//   course_name: string;
//   slug: string;
//   course_code: string;

//   course_description?: string;
//   course_duration?: number;
//   course_fee?: string | number;
//   course_level?: string;
//   age_limit?: string;

//   start_date?: string;
//   end_date?: string;
//   status?: string;
//   is_featured?: boolean;

//   thumbnail_image?: string;
//   short_description?: string;
//   benefits?: string;

//   created_at?: string;
//   updated_at?: string;
// }

// // ===== Course Curriculum Interface =====
// export interface CourseCurriculum {
//   id?: number;

//   course_id: number; // FK
//   title: string;
//   type: 'video' | 'reading';
//   is_active?: boolean;
//   video_url?: string; // video type
//   documents?: string; // reading type

//   description?: string;
//   duration?: string;
//   sorting_order?: number;
//   status?: string;

//   created_at?: string;
//   updated_at?: string;

//   // relation
//   course?: Course;
// }

// // ===== Payload (Create / Update) =====
// export interface CourseCurriculumPayload {
//   course_id: number;
//   title: string;
//   type: 'video' | 'reading';

//   video_url?: string;
//   documents?: string;

//   description?: string;
//   duration?: string;
//   sorting_order?: number;
//   status?: string;
// }

// // ===== API Response =====

// export interface CourseCurriculumApiResponse {
//   success?: boolean;
//   message?: string;
//   data: CourseCurriculum | CourseCurriculum[];
// }
// course-curriculum.model.ts
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

// ===== Single curriculum item (for "Add More" rows) =====
export interface CurriculumItem {
  title: string;
  duration: number | null;   // stored as weeks count
  description: string;
  sorting_order?: number;
}

// ===== Course Curriculum Interface =====
export interface CourseCurriculum {
  id?: number;

  course_id: number;
  title: string;
  description?: string;
  duration?: number;         // weeks
  sorting_order?: number;

  // ADDED MISSING PROPERTIES
  type?: 'video' | 'document' | 'quiz' | string;
  documents?: string | string[] | null;
  video_url?: string;

  created_at?: string;
  updated_at?: string;

  // relation
  course?: Course;
}

// ===== Payload (single) =====
export interface CourseCurriculumPayload {
  course_id: number;
  title: string;
  description?: string;
  duration?: number;
  sorting_order?: number;
  type?: string;
  documents?: string | string[] | null;
  video_url?: string;
}

// ===== Payload (bulk) =====
export interface CourseCurriculumBulkPayload {
  course_id: number;
  items: CurriculumItem[];
}

// ===== API Response =====
export interface CourseCurriculumApiResponse {
  success?: boolean;
  message?: string;
  data: CourseCurriculum | CourseCurriculum[];
}