import { Container } from "../container";
import { Slide } from "react-awesome-reveal";
import { MetaModule } from "~/services/sanity/types";
import { MetaModules } from "../catalog/meta-modules";

export function Modules({ modules }: { modules: Promise<MetaModule[]> }) {
  return (
    <Container className="bg-white mb-8" id="modules">
      <div className="flex flex-col items-center max-w-6xl mx-auto gap-8">
        <Slide direction="right" cascade duration={300} className="w-full">
          <h1 className="text-3xl text-blue-600 font-bold text-center">
            Modules
          </h1>
          <MetaModules modules={modules} />
        </Slide>
      </div>
    </Container>
  );
}
