export interface Announcement {
  id?: number;
  title: string;
  message: string;
  announced_by?: 'admin' | 'instructor';
  announced_by_id?: number;
  status: 'draft' | 'sent' | 'scheduled';
  priority: 'low' | 'normal' | 'high';
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
  course_id?: number;
  batch_id?: number;
  total_students?: number;

  course?: {
    course_name: string;
    course_code: string;
  };
  batch?: {
    name: string;
  };
}



export interface AnnouncementApiResponse {
  success: boolean;
  message?: string;
  data: Announcement | Announcement[];
}