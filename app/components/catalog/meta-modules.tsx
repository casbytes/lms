import React from "react";
import { MetaModule } from "~/services/sanity/types";
import { SearchInput } from "../search-input";
import { Await } from "@remix-run/react";
import { Fade } from "react-awesome-reveal";
import { Button } from "../ui/button";
import { CatalogDialog } from "./catalog-dialog";
import { DialogTrigger } from "../ui/dialog";
import { cn } from "~/libs/shadcn";
import { CurrentItem } from "~/utils/helpers.server";


export function MetaModules({
  modules,
  user,
  currentItem,
}: {
  modules: Promise<MetaModule[]>;
  user: { subscribed: boolean };
  currentItem: CurrentItem;
}) {
  const [initialModules, setInitialModules] = React.useState(16);
  return (
    <>
      <div className="md:max-w-[60%] mb-8 w-full mx-auto mt-4">
        <SearchInput
          searchValue="moduleTitle"
          placeholder="search modules"
          className="bg-white shadow-lg p-2"
        />
      </div>
      <React.Suspense fallback={<p>Loading...</p>}>
        <Await resolve={modules}>
          {(modules) => (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-end relative">
                <Fade cascade damping={0.1} duration={200}>
                  {modules?.length ? (
                    modules.slice(0, initialModules).map((module, index) => (
                      <div
                        key={`${module.id}-${index}`}
                        className={cn(
                          "bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-center",
                          {
                            "bg-cover": index % 2 === 0,
                            "bg-contain": index % 2 === 1,
                          }
                        )}
                      >
                        <CatalogDialog
                          user={user}
                          module={module}
                          currentItem={currentItem}
                          cardActionButton={
                            <DialogTrigger asChild>
                              <Button variant={"outline"} size={"sm"}>
                                learn more
                              </Button>
                            </DialogTrigger>
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center w-full mx-auto text-xl font-mono mt-4 absolute">
                      No modules match your search, try again.
                    </div>
                  )}
                </Fade>
              </div>
              {modules?.length ? (
                <Button
                  size={"lg"}
                  onClick={() => setInitialModules((initM) => initM + 10)}
                  disabled={initialModules >= modules.length}
                className="disabled:cursor-not-allowed mx-auto block mt-8 shadow-xl uppercase"
                >
                  load more
                </Button>
              ) : null}
            </>
          )}
        </Await>
      </React.Suspense>
    </>
  );
}
