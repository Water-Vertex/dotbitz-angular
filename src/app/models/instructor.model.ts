/**
 * Instructor Models
 * Covers:
 *  - instructors table
 *  - instructor_details table
 *  - single payload for create/update
 */

/* =========================
   Instructor (Main Table)
   ========================= */
export interface Instructor {
  id?: number;

  instructor_uid?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  user_name?: string | null;

  email?: string | null;
  phone?: string | null;

  gender?: 'male' | 'female' | 'other' | null;

  address?: string | null;
  state?: string | null;
  city?: string | null;
  zipcode?: string | null;

  work_experience?: string | null;
  salary?: string | null;

  status?: string | null;

  created_at?: string;
  updated_at?: string;
}

/* =========================
   Instructor Details Table
   ========================= */
export interface InstructorDetail {
  id?: number;
  instructor_id?: number;

  institution: string;
  degree: string;
  field_of_study?: string | null;

  start_date: string; // YYYY-MM-DD
  end_date?: string | null;

  is_current: boolean;

  description?: string | null;

  created_at?: string;
  updated_at?: string;
}

/* =========================
   Payload for Create / Update
   (Single API Request)
   ========================= */
export interface InstructorPayload {
  // Instructor fields
  instructor_uid?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  user_name?: string | null;

  email?: string | null;
  phone?: string | null;

  gender?: 'male' | 'female' | 'other' | null;

  address?: string | null;
  state?: string | null;
  city?: string | null;
  zipcode?: string | null;

  work_experience?: string | null;
  salary?: string | null;

  password?: string | null; // used only on create
  status?: string | null;

  // 🔗 HAS MANY
  details: InstructorDetail[];
}

/* =========================
   API Response (Optional)
   ========================= */
export interface InstructorApiResponse {
  success: boolean;
  message?: string;
  data: Instructor & {
    details?: InstructorDetail[];
  };
}
