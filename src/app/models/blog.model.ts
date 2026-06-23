export interface Blog {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  meta_description: string | null;
  meta_title: string | null;
  meta_keywords: string | null;
  meta_tags: string | null;
  page_schemas: any | null;
  created_at: string;
  updated_at: string;
}

export interface BlogFormData {
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  meta_description?: string | null;
  meta_title?: string | null;
  meta_keywords?: string | null;
  meta_tags?: string | null;
  page_schemas?: any | null;
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  data: Blog;
}

export interface BlogListResponse {
  success: boolean;
  data: Blog[];
  total?: number;
  current_page?: number;
  per_page?: number;
}
