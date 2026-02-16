export interface Policies {
  id: number;
  title: string;
  description: string;
  meta_title: string;
  meta_keywords: string;
  meta_tags: string;
  meta_description: string;
  created_at?: string;
  updated_at?: string;
}
export interface PolicyFormData {
  title: string;
  description: string;
  meta_title: string;
  meta_keywords: string;
  meta_tags: string;
  meta_description: string;
}

export interface PolicyListResponse {
  data: Policies[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  message?: string;
}
