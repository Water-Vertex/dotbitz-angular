export interface FAQ {
  id: number;
  question: string;
  answer: string
  created_at?: string;
  updated_at?: string;
}
export interface FAQFormData {
  question: string;
  answer: string;
}

export interface FAQListResponse {
  data: FAQ[];
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
