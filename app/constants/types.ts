export interface ICourseProgress {
  id: string;
  title: string;
  slug: string;
  userId: string;
  score: number;
  status: string;
  modules?: any;
}

export interface ICourse {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

export interface ICurrentUser {
  userId: string;
  email: string;
  name: string;
  avatar_url: string;
  authType: string;
  currentUrl: string | null;
  completedOnboarding: boolean;
}
