export interface AssignAssessment {
  id: number;
  appointment_id: number;
  assessment_id: number;
  time_to_complete: number;
  total_marks: number;
  obtain_marks?: number;
  remarks?: string;
  status?: 'pending' | 'marked';

  // Relationships
  appointment?: Appointment;
  assessment?: Assessment;
  created_at?: string;
  updated_at?: string;
}
export interface Assessment {
  id: number;
  assessment_title?: string;
  question?: string;
  answer?: string;
  options?: string[];
  course_id: number;
  assessment_type?: string;
  status?: string;
}

export interface Course {
  id: number;
  course_name: string;
  slug?: string;
  course_code?: string;
}

export interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  course_id: number;
  course?: Course; // Relationship
}
