export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Add this interface
export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Optional: Add Auth Response base interface
export interface AuthResponse {
  success: boolean;
  message?: string;
}