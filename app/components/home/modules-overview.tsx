import React from "react";
import { Container } from "../container";
import { Button } from "../ui/button";
import { cn } from "~/libs/shadcn";
import { Fade, Slide } from "react-awesome-reveal";
import { MetaModule } from "~/services/sanity/types";
import { DialogTrigger } from "../ui/dialog";
import { Await } from "@remix-run/react";
import ModuleDialog from "../module-dialog";

export function ModulesOverview({
  modules,
}: {
  modules: Promise<MetaModule[]>;
}) {
  const [initialModules, setInitialModules] = React.useState(20);
  return (
    <Container className="bg-white mb-8" id="moduless">
      <div className="flex flex-col items-center max-w-6xl mx-auto gap-8">
        <Slide direction="right" cascade duration={300}>
          <h1 className="text-3xl text-blue-600 font-bold mb-8">Modules</h1>

          <React.Suspense fallback={<p>Loading...</p>}>
            <Await resolve={modules}>
              {(modules) => (
                <>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center">
                    <Fade cascade damping={0.1} duration={200}>
                      {modules?.length ? (
                        modules
                          .slice(0, initialModules)
                          .map((module, index) => (
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
                              <ModuleDialog
                                module={module}
                                cardButton={
                                  <DialogTrigger asChild>
                                    <Button variant={"secondary"} size={"sm"}>
                                      learn more
                                    </Button>
                                  </DialogTrigger>
                                }
                              />
                            </div>
                          ))
                      ) : (
                        <p>No modules</p>
                      )}
                    </Fade>
                  </div>
                  <Button
                    onClick={() => setInitialModules((initM) => initM + 10)}
                    disabled={initialModules >= modules.length}
                    className="disabled:cursor-not-allowed mx-auto block mt-8 shadow-xl"
                  >
                    {initialModules < modules.length
                      ? "Load more"
                      : "No more modules"}
                  </Button>
                </>
              )}
            </Await>
          </React.Suspense>
        </Slide>
      </div>
    </Container>
  );
}
