import { ArrowLeft, CircleHelp, LibraryBig } from "lucide-react";
import { Container } from "./container";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";

export function NotFoundUI() {
  return (
    <Container className="bg-2 bg-no-repeat bg-cover h-screen">
      <div className="flex flex-col p-10 gap-6 bg-sky-200/30 max-w-5xl mx-auto bg-no-repeat bg-center rounded-lg drop-shadow-md">
        <img
          src="https://cdn.casbytes.com/assets/logo.png"
          className="w-40 h-8 mx-auto mb-4"
          alt="CASBytes"
        />
        <div className="text-[10rem] max-w-xl mx-auto text-center flex items-center justify-around">
          4 <CircleHelp size={120} className="text-blue-600 font-bold inline" />
          4
        </div>
        <p className="text-3xl text-center max-w-md mx-auto">
          The page you are requesting for could not be found.
        </p>
        <div className="flex flex-col gap-6 mt-8 md:mt-20">
          <Button size="lg" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-6 w-6" /> Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/courses">
              Courses <LibraryBig className="ml-2 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
