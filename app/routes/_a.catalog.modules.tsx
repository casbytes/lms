import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { FaStar } from "react-icons/fa6";
import { URL } from "url";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { ModuleSearchInput } from "~/components/search-input";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { getMetaModules } from "~/services/sanity/index.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("moduleTitle");
  return await getMetaModules(search);
}

export default function CoursesCatalogRoute() {
  const modules = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-5xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title="modules" />
      <div className="my-8">
        <ModuleSearchInput
          searchValue="moduleTitle"
          placeholder="search modules"
          className="bg-white shadow-lg p-2"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {modules?.length ? (
          modules.map((module, index) => (
            <div
              key={`${module.id}-${index}`}
              // className={cn(
              //   "bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-center",
              //   {
              //     "bg-cover": index % 2 === 0,
              //     "bg-contain": index % 2 === 1,
              //   }
              // )}
            >
              <Dialog>
                <DialogContent>{module.title}</DialogContent>
                <Card
                  aria-label={module.title}
                  className="shadow-xl text-center mx-auto bg-white/95"
                >
                  <CardHeader className="items-center flex flex-col relative p-2">
                    <h2 className="text-blue-700 capitalize font-black text-sm font-mono z-10">
                      {module.title}
                    </h2>
                    <Button
                      variant="secondary"
                      size={"sm"}
                      className="mt-2"
                      asChild
                    >
                      <DialogTrigger>Add to catalog</DialogTrigger>
                    </Button>
                    {/* <Badge className="absolute rounded-bl-none rounded-tr-none -top-[0.4rem] left-0 bg-white text-sky-600 hover:bg-white">
                      free
                    </Badge> */}
                    {/* <Badge className="absolute rounded-bl-none rounded-tr-none bottom-0 right-0">
                      <FaStar className="mr-2" />
                      4.5
                    </Badge> */}
                  </CardHeader>
                </Card>
              </Dialog>
            </div>
          ))
        ) : (
          <div className="text-center col-span-4 font-mono text-3xl text-slate-500">
            No modules match your search, try again.
          </div>
        )}
      </div>
    </Container>
  );
}
