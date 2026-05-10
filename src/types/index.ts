export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  prevClassId?: string;
  prevClassName?: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  title: string;
  description?: string;
  allowedGrades?: string[]; // Qaysi sinflar uchun ochiqligi (masalan: ["5", "9"])
  createdAt: number;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  gradeLevel?: string;
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
  isAdminResult?: boolean;
}
