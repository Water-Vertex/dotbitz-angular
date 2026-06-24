// models/guardians.model.ts
export interface Guardian {
  id?: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}




