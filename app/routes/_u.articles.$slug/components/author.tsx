import { Image } from "~/components/image";
import { Author as A } from "~/services/sanity/types";

export function Author({ author }: { author: A }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-evenly sm:justify-center gap-8">
      <div className="w-32 h-32 mx-auto flex-shrink-0">
        <Image
          cdn={false}
          src={author.image}
          alt={author.name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="flex flex-col text-center sm:text-left items-center sm:items-start">
        <h2 className="text-xl font-bold">
          <span className="text-lg">Written by</span>{" "}
          <span className="font-mono">{author.name}</span>
        </h2>
        <p className="font-mono text-slate-600">{author.profession}</p>
        <p className="text-sm">{author.bio}</p>
      </div>
    </div>
  );
}
