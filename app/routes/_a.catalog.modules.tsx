import { BackButton } from "~/components/back-button";
import { CatalogCard } from "~/components/catalog-card";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { ModuleSearchInput } from "~/components/search-input";
import { Button } from "~/components/ui/button";

export default function ModuleCatalogRoute() {
  return (
    <Container className="max-w-5xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title="modules" />
      <div className="my-8">
        <ModuleSearchInput
          searchValue="search"
          placeholder="search modules"
          className="bg-white shadow-lg"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CatalogCard isAuth={true} button={<Button>Add to catalog</Button>} />
        <CatalogCard
          isAuth={true}
          button={<Button>Add to catalog</Button>}
        />{" "}
        <CatalogCard isAuth={true} button={<Button>Add to catalog</Button>} />{" "}
        <CatalogCard isAuth={true} button={<Button>Add to catalog</Button>} />{" "}
        <CatalogCard isAuth={true} button={<Button>Add to catalog</Button>} />
        <CatalogCard
          isAuth={true}
          button={<Button>Add to catalog</Button>}
        />{" "}
        <CatalogCard isAuth={true} button={<Button>Add to catalog</Button>} />
      </div>
    </Container>
  );
}
