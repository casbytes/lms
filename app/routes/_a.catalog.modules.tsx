import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { URL } from "url";
import { BackButton } from "~/components/back-button";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getMetaModules } from "~/services/sanity/index.server";
import { MetaModules } from "~/components/catalog/meta-modules";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("moduleTitle");
  return defer({ modules: getMetaModules(search) });
}

export default function CoursesCatalogRoute() {
  const { modules } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-6xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title="modules" />
      <MetaModules modules={modules} />
    </Container>
  );
}
