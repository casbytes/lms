import { Link } from "@remix-run/react";
import { Container } from "../container";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "~/libs/shadcn";
import { Fade, Slide } from "react-awesome-reveal";
import { FaArrowRight } from "react-icons/fa6";

export function CoursesOverview() {
  return (
    <Container className="bg-white mb-8" id="courses">
      <div className="flex flex-col items-center max-w-6xl mx-auto gap-8">
        <Slide direction="right" cascade duration={300}>
          <h1 className="text-3xl text-blue-600 font-bold mb-8">Courses</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Fade cascade damping={0.1} duration={200}>
              {items.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className={cn(
                    "bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-center",
                    {
                      "bg-cover": index % 2 === 0,
                      "bg-contain": index % 2 === 1,
                    }
                  )}
                >
                  <Card
                    key={`item-${index}`}
                    aria-label={item.title}
                    className="drop-shadow-xl rounded-md text-center mx-auto bg-white/95 pt-4 px-4"
                  >
                    <CardContent className="items-center flex flex-col  ">
                      <img
                        src={`https://cdn.casbytes.com/assets/${item.image}`}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="w-16 h-16 mx-auto"
                      />
                      <h2 className="text-lg text-blue-700 capitalize font-black mt-4">
                        {item.title}
                      </h2>
                      <Button variant="ghost" asChild>
                        <Link to={`/courses${item.href}`} className="mt-4">
                          Learn more
                          <FaArrowRight className="ml-4 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </Fade>
          </div>
        </Slide>
      </div>
    </Container>
  );
}

const items = [
  {
    image: "frontend.png",
    title: "Front-end development",
    href: "#frontend",
  },
  {
    image: "backend.png",
    title: "Backe-end development",
    href: "#backend",
  },
  {
    image: "fullstack.png",
    title: "Fullstack development",
    href: "#fullstack",
  },
  {
    image: "dsa.png",
    title: "Data structures and algorithms",
    href: "#dsa",
  },
  {
    image: "se-architecture.png",
    title: "software engineering",
    href: "#se",
  },
];
