// models/class-schedule.model.ts
export interface ClassSchedule {
  id?: number;
  course_id: number;
  instructor_id: number;
  start_time: string;
  end_time: string;
  meeting_link: string;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: number;
  course_name: string;
  // add other course fields as needed
}

export interface Instructor {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  user_name?: string | null;

  email?: string | null;
  phone?: string | null;
  // add other instructor fields as needed
}
