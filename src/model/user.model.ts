export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
}

// Simulating a database
export const users: User[] = [];
