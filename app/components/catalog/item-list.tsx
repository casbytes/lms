import { MetaCourse, MetaModule } from "~/services/sanity/types";

export function ItemList({
  course,
  module,
}: {
  course?: MetaCourse;
  module?: MetaModule;
}) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2">
      {course
        ? course.modules?.map((module, index: number) => (
            <li key={module.id}>
              <h2>
                {index + 1}. {module.title}
              </h2>
            </li>
          ))
        : module?.subModules?.map((subModule, index: number) => (
            <li key={subModule.id}>
              <h3>
                {index + 1}. {subModule.title}
              </h3>
            </li>
          ))}
    </ul>
  );
}
