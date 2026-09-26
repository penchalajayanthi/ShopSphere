import type { User } from "../types/user";

export const users: User[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@shopsphere.com",
    password: "admin123",
    role: "admin",
  },

  {
    id: 2,
    name: "Demo Customer",
    email: "customer@shopsphere.com",
    password: "customer123",
    role: "customer",
  },
];