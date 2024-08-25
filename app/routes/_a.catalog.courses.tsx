import { BackButton } from "~/components/back-button";
import { CatalogCard } from "~/components/catalog-card";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { ModuleSearchInput } from "~/components/search-input";
import { Button } from "~/components/ui/button";

export default function CourseCatalogRoute() {
  return (
    <Container className="max-w-5xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title="courses" />
      <h1 className="text-6xl font-mono text-center mt-12">COMING SOON!</h1>
      {/* <div className="my-8 mx-auto max-w-3xl">
        <ModuleSearchInput
          searchValue="search"
          className="bg-white shadow-lg"
        />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <CatalogCard button={<Button>Add to catalog</Button>} />
        <CatalogCard button={<Button>Add to catalog</Button>} />
        <CatalogCard button={<Button>Add to catalog</Button>} />
      </div> */}
    </Container>
  );
}
