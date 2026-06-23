export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoleFormData {
  name: string;
}

export interface RoleListResponse {
  success: boolean;
  data: Role[];
}