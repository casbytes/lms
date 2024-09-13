import { Image } from "~/components/image";
import { Author as A } from "~/services/sanity/types";

export function Author({ author }: { author: A }) {
  return (
    <div className="flex gap-8 items-center flex-col sm:flex-row justify-center sm:justify-start ">
      <div className="w-[60%] h-full mx-auto">
        <Image
          cdn={false}
          src={author.image}
          alt={author.name}
          className="rounded-full w-40 h-40 object-cover mx-auto"
        />
      </div>
      <div className="flex flex-col">
        <h2 className="text-xl font-bold">
          Written by <span className="font-mono">{author.name}</span>
        </h2>
        <p className="font-mono text-slate-600">{author.profession}</p>
        <p className="text-sm">{author.bio}</p>
      </div>
    </div>
  );
}
