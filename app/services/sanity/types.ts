import { Reviews, User } from "~/utils/db.server";
type TestEnv = "node" | "browser" | "python";

export interface ReviewWithUser extends Reviews {
  user: User;
}

export interface MetaCourse {
  id: string;
  title: string;
  image: string;
  slug: string;
  inCatalog: boolean;
  reviews?: ReviewWithUser[];
  testEnvironment?: TestEnv;
  description: string;
  modules: MetaModule[];
}

export interface MetaModule {
  id: string;
  title: string;
  slug: string;
  tags: string;
  checkpoint?: boolean;
  premium: boolean;
  description: string;
  inCatalog: boolean;
  reviews?: ReviewWithUser[];
  testEnvironment?: TestEnv;
  deascription: string;
  subModules: MetaSubModule[];
}

export interface MetaSubModule {
  id: string;
  title: string;
  slug: string;
  checkpoint?: boolean;
  testEnvironment?: TestEnv;
  lessons: MetaLesson[];
}

export interface MetaLesson {
  id: string;
  title: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  tags: string;
  image: string;
  description: string;
  content: string;
  author: Author;
}

export interface Author {
  id: string;
  name: string;
  profession: string;
  bio: string;
  image: string;
}
