import { ArrowLeft, CircleHelp, LibraryBig } from "lucide-react";
import { Container } from "./container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";

export function NotFoundUI() {
  return (
    <Container className="bg-header-2 bg-no-repeat bg-cover h-screen">
      <div className="bg-[url('/favicon.png')] max-w-3xl mx-auto bg-no-repeat bg-center">
        <Card className="flex flex-col gap-6 max-w-lg mx-auto bg-sky-300/95">
          <CardHeader className="flex flex-col gap-2">
            <img
              src="https://cdn.casbytes.com/assets/logo.png"
              className="w-40 h-8 mx-auto mb-4"
              alt="CASBytes"
            />

            <CircleHelp
              size={120}
              className="text-blue-500  mx-auto font-bold"
            />
            <CardTitle className="capitalize text-4xl font-medium text-center">
              Ooops!
            </CardTitle>
            <CardDescription className="capitalize text-xl font-medium text-center">
              The page you are requesting for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-6">
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
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
