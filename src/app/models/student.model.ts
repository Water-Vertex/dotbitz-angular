// models/student.model.ts
export interface Student {
  id?: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  guardian?: Guardian;              // <- add this
  student_details?: StudentDetail[]
  password: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentDetail {
  id?: number;
  student_id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Guardian {
  id?: number;
  student_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  relationship: 'parent' | 'legal_guardian' | 'sibling' | 'other';
}

export interface RegistrationRequest {
  student: Student;
  student_details: StudentDetail[];
  guardian?: Guardian;
}
