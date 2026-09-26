export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
}