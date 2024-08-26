type TestEnv = "node" | "browser" | "python";

export interface MetaCourse {
  id: string;
  title: string;
  slug: string;
  testEnvironment?: TestEnv;
  modules: MetaModule[];
}

export interface MetaModule {
  id: string;
  title: string;
  slug: string;
  checkpoint?: boolean;
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
