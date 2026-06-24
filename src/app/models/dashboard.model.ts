export interface DashboardStats {
  total_students: number;
  total_courses: number;
  total_assessments: number;
  total_assignments: number;
  total_assessments_queries: number;
  total_quizzes: number;
  total_batches: number;
  total_guardians: number;
  total_instructors: number;
  completed_courses: number;
  in_progress_courses: number;
  completed_assessments: number;
  pending_assessments: number;
  submitted_assignments: number;
  pending_assignments: number;
  average_completion_rate: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}
