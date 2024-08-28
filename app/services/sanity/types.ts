type TestEnv = "node" | "browser" | "python";

export interface MetaCourse {
  id: string;
  title: string;
  image: string;
  slug: string;
  premium: boolean;
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
