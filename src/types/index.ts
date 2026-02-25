export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  createdAt: number;
}

export interface TestResult {
  id?: string;
  userId: string;
  subjectId: string;
  subjectTitle: string;
  score: number;
  total: number;
  timeSpent: number; // in seconds
  createdAt: number;
}
