export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface LogoutResponse {
  message: string;
}
