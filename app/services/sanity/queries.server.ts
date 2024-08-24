import groq from "groq";

export const COURSES_QUERY = groq`*[_type=="course" && published==true]{
  "id":_id,
  title,
  "slug":slug.current,
  published,
  testEnvironment,
  "modules": module[]->{
    "id":_id,
    title,
    "slug":slug.current,
    checkpoint,
    testEnvironment,
    "subModules": subModule[]->{
      "id":_id,
      title,
      "slug":slug.current,
      checkpoint,
      testEnvironment,
      "lessons": lesson[]->{
        "id":_id,
        title,
        "slug":slug.current,
      }
    }
  }
}`;

export const COURSE_BY_ID_QUERY = groq`*[_type=="course" && _id==$id][0]{
    "id":_id,
    title,
    "slug":slug.current,
    testEnvironment,
    "modules": module[]->{
        "id":_id,
        title,
        "slug":slug.current,
        checkpoint,
        testEnvironment,
        "subModules": subModule[]->{
        "id":_id,
        title,
        "slug":slug.current,
        checkpoint,
        testEnvironment,
        "lessons": lesson[]->{
            "id":_id,
            title,
            "slug":slug.current,
        }
        }
    }
    }`;

export const MODULES_QUERY = groq`*[_type == "module"] | order(title asc){
        "id": _id,
        title,
        "slug": slug.current,
        checkpoint,
        testEnvironment,
        "subModules": subModules[]->{
          "id": _id,
          title,
          "slug": slug.current,
          checkpoint,
          testEnvironment,
          "lessons": lessons[]->{
            "id": _id,
            title,
            "slug": slug.current
          }
        }
      }`;

export const MODULE_BY_ID_QUERY = groq`*[_type=="module" && _id==$id][0]{
        "id":_id,
        title,
        "slug":slug.current,
        checkpoint,
        testEnvironment,
        "subModules": subModule[]->{
            "id":_id,
            title,
            "slug":slug.current,
            checkpoint,
            testEnvironment,
            "lessons": lesson[]->{
                "id":_id,
                title,
                "slug":slug.current,
            }
        }
        }`;
