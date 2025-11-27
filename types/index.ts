export interface User {
  id: string;
  name: string;
  email: string;
  division: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  status: 'active' | 'draft';
  createdBy: string;
  createdAt: Date;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document';
  videoUrl?: string;
  duration?: number;
  watermark?: boolean;
  forceComplete?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Progress {
  userId: string;
  courseId: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  lastAccess: Date;
  completedAt?: Date;
}