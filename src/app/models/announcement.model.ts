export interface Announcement {
  id?: number;
  title: string;
  message: string;
  announced_by?: string;
  announced_by_id?: number;
  status: 'draft' | 'sent' | 'scheduled';
  priority: 'low' | 'normal' | 'high';
  target_type?: 'overall' | 'course_batch' | 'instructor'; // optional
  course_id?: number | null;
  batch_id?: number | null;
  target_instructor_ids?: number[] | null;
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementApiResponse {
  success: boolean;
  message?: string;
  data: Announcement | Announcement[];
}