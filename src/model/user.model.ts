export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  cv?: File;
}

// Simulating a database
export const users: User[] = [];
