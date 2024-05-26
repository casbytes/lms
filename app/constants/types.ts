export interface ISessionUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  authType: string;
}

export interface IUser {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  currentUrl?: string | null;
  completedOnboarding: boolean;
}

export type ICurrentUser = Omit<ISessionUser, "id"> & IUser;

export interface ICourse {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  jsonId: string;
  modules?: IModule[];
}

export interface IModule {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  jsonId: string;
  courseId: string;
  course?: ICourse;
  submodules?: ISubmodule[];
}

export interface ISubmodule {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  jsonId: string;
  moduleId: string;
  module?: IModule;
  lessons?: ILesson[];
}

export interface ILesson {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  jsonId: string;
  subModuleId: string;
  subModule?: ISubmodule;
}

export interface ICourseProgress {
  id: string;
  title: string;
  slug: string;
  userId: string;
  score: number;
  projectId: string;
  status: string;
  user?: ICurrentUser;
  moduleProgress?: IModuleProgress[];
  project?: IProject;
}

export interface IModuleProgress {
  id: string;
  title: string;
  slug: string;
  userId: string;
  courseProgressId: string;
  score: number;
  testId: string;
  checkpointId: string;
  status: string;
  user?: ICurrentUser;
  courseProgress?: ICourseProgress;
  subModuleProgress?: ISubModuleProgress[];
  badges?: IBadge[];
  test?: ITest;
  checkpoint?: ICheckpoint;
}

export interface ISubModuleProgress {
  id: string;
  title: string;
  slug: string;
  userId: string;
  score: number;
  moduleProgressId: string;
  testId: string;
  checkpointId: string;
  status: string;
  user: ICurrentUser;
  moduleProgress: IModuleProgress;
  lessonProgress: ILessonProgress[];
  test: ITest;
  checkpoint: ICheckpoint;
}

export interface ILessonProgress {
  id: string;
  title: string;
  slug: string;
  userId: string;
  status: string;
  subModuleProgressId: string;
  user?: ICurrentUser;
  subModuleProgress?: ISubModuleProgress;
}

export interface IBadge {
  id: string;
  title: string;
  locked_description: string;
  unlocked_description: string;
  level: string;
  status: string;
  userId: string;
  moduleProgressId: string;
  user?: ICurrentUser;
  moduleProgress?: IModuleProgress;
}

export interface ICheckpoint {
  id: string;
  title: string;
  score: number;
  status: string;
  userId: string;
  moduleProgressId?: string | null;
  subModuleProgressId?: string | null;
  user?: ICurrentUser;
  moduleProgress?: IModuleProgress[];
  subModuleProgress?: ISubModuleProgress[];
}

export interface ITest {
  id: string;
  title: string;
  status: string;
  score: number;
  attempts: number;
  attempted: boolean;
  nextAttemptAt?: Date;
  userId: string;
  moduleProgressId?: string;
  subModuleProgressId?: string;
  user?: ICurrentUser;
  moduleProgress: IModuleProgress[];
  subModuleProgress: ISubModuleProgress[];
}

export interface IProject {
  id: string;
  title: string;
  slug: string;
  status: string;
  userId: string;
  user?: ICurrentUser;
  courseProgress?: ICourseProgress[];
}

export enum CourseProgressStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum Status {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TestStatus {
  LOCKED = "LOCKED",
  COMPLETED = "COMPLETED",
}

export enum BadgeLevel {
  NOVICE = "NOVICE",
  ADEPT = "ADEPT",
  PROFICIENT = "PROFICIENT",
  VIRTUOSO = "VIRTUOSO",
}

export enum BadgeStatus {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
}
