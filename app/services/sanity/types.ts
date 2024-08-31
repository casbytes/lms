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
  premium: boolean;
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
  premium: boolean;
  checkpoint?: boolean;
  description: string;
  inCatalog: boolean;
  reviews?: ReviewWithUser[];
  testEnvironment?: TestEnv;
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
