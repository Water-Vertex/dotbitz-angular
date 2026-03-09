// models/class-schedule.model.ts
export interface ClassSchedule {
  id?: number;
  course_id: number;
  instructor_id: number;
  batch_id: number;
  start_time: string;
  end_time: string;
  meeting_link: string;
  day: string; // Changed from number to string - values: 'monday', 'tuesday', etc.
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  note: string; // New field for additional notes
  created_at?: string;
  updated_at?: string;

  // Optional relations
  course?: Course;
  batch?: Batch;
  instructor?: Instructor;
}

export interface Course {
  id: number;
  course_name: string;
  name?: string; // Add alias for flexibility
  title?: string; // Add alias for flexibility
  // add other course fields as needed
}

export interface Instructor {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  user_name?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string; // Add computed field for display
  // add other instructor fields as needed
}

// Add Batch interface (missing from your model)
export interface Batch {
  id: number;
  name: string;
  course_id: number;
  start_date?: string;
  end_date?: string;
  students?: string;
  status?: string;
  note?: string; // New field for additional notes
}

// Optional: Create a type for day values
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Optional: Create a constant for day mapping (useful for dropdowns)
export const DAYS_OF_WEEK: { value: DayOfWeek, label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];
