import { Container } from "../container";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { cn } from "~/libs/shadcn";
import { Fade, Slide } from "react-awesome-reveal";
import { MetaModule } from "~/services/sanity/types";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { FaStar } from "react-icons/fa6";

export function ModulesOverview({ modules }: { modules: MetaModule[] }) {
  return (
    <Container className="bg-white mb-8" id="moduless">
      <div className="flex flex-col items-center max-w-6xl mx-auto gap-8">
        <Slide direction="right" cascade duration={300}>
          <h1 className="text-3xl text-blue-600 font-bold mb-8">Modules</h1>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center">
            <Fade cascade damping={0.1} duration={200}>
              {modules?.length ? (
                modules.map((module, index) => (
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
                    <Dialog>
                      <DialogContent>{module.title}</DialogContent>
                      <Card
                        aria-label={module.title}
                        className="shadow-xl text-center mx-auto bg-white/95 p-2"
                      >
                        <CardHeader className="items-center flex flex-col relative">
                          <h2 className="text-blue-700 capitalize font-black text-sm font-mono">
                            {module.title}
                          </h2>
                          <Button
                            variant="secondary"
                            size={"sm"}
                            className="mt-2"
                            asChild
                          >
                            <DialogTrigger>Learn more</DialogTrigger>
                          </Button>
                          <Badge className="absolute rounded-bl-none rounded-tr-none -top-[0.4rem] left-0 bg-white text-sky-600 hover:bg-white">
                            free
                          </Badge>
                          <Badge className="absolute rounded-bl-none rounded-tr-none bottom-0 right-0">
                            <FaStar className="mr-2" />
                            4.5
                          </Badge>
                        </CardHeader>
                      </Card>
                    </Dialog>
                  </div>
                ))
              ) : (
                <p>No modules</p>
              )}
            </Fade>
          </div>
        </Slide>
      </div>
    </Container>
  );
}
