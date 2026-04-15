export interface DashboardStats {
  total_students: number;
  total_instructors: number;
  total_guardians: number;
  total_assessments_queries: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}
