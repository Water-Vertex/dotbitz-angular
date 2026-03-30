// ===== Course Interface (same as yours) =====
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

// ===== Appointment Interface =====
export interface Appointment {
  id?: number;

  course_id: number; // FK (relation with course)

  name: string;
  email: string;
  contact_number: string;

  appointment_date: string;
  appointment_time?: string;

  message?: string;
  status?: string | number;

  created_at?: string;
  updated_at?: string;

  course?: Course; // relation
}

// ===== Payload (Create / Update) =====
// export interface AppointmentPayload {
//   course_id: number;

//   name: string;
//   email: string;
//   contact_number: string;

//   appointment_date: string;
//   appointment_time?: string;

//   message?: string;
// }

// ===== API Response =====
export interface AppointmentApiResponse {
  success?: boolean;
  message?: string;
  data: Appointment | Appointment[];
}
