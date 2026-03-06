export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
  Student?: any;

}
// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: string; // admin | student
// }

// export interface LoginResponse {
//   success: boolean;
//   token: string;
//   message?: string;
//   User?: {        // admin login ke liye
//     id: number;
//     name: string;
//     email: string;
//   };
//   Student?: {     // student login ke liye
//     id: number;
//     name: string;
//     email: string;
//   };
// }

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

