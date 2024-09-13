import groq from "groq";

// #### COURSES AND MODULES ####
export const COURSES_QUERY = groq`*[_type=="course" && published==true] | order(title asc){
  "id":_id,
  title,
  image,
  "slug":slug.current,
  published,
  testEnvironment,
  description,
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

export const COURSE_BY_ID_QUERY = groq`*[_type=="course" && _id==$id]{
  "id":_id,
  title,
  image,
  "slug":slug.current,
  published,
  testEnvironment,
  description,
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

export const MODULES_QUERY = groq`*[_type == "module" && published==true] | order(title asc){
  "id": _id,
  title,
  "slug": slug.current,
  tags,
  checkpoint,
  published,
  premium,
  testEnvironment,
  description,
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
  "id": _id,
  title,
  "slug": slug.current,
  tags,
  checkpoint,
  published,
  premium,
  testEnvironment,
  description,
  "subModules": subModule[]->{
    "id": _id,
    title,
    "slug": slug.current,
    checkpoint,
    testEnvironment,
    "lessons": lesson[]->{
      "id": _id,
      title,
      "slug": slug.current
    }
  }
}`;

export const ARTICLES_QUERY = groq`*[_type == "article" && published==true] | order(createdAt desc){
        "id": _id,
        title,
        "slug": slug.current,
        createdAt,
        tags,
        published,
        "image": image.asset->url,
        description,
        content,
        "author": author->{
          "id": _id,
          name,
          profession,
          bio,
          "image": image.asset->url
        }
      }`;

export const ARTICLE_QUERY = groq`*[_type == "article" && slug.current==$slug][0]{
        "id": _id,
        title,
        "slug": slug.current,
        createdAt,
        tags,
        published,
        "image": image.asset->url,
        description,
        content,
        videoId,
        "author": author->{
          "id": _id,
          name,
          profession,
          bio,
          "image": image.asset->url
        }
      }`;
