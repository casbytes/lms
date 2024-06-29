import { Link } from "@remix-run/react";
import { Slide, Fade } from "react-awesome-reveal";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { Container } from "../container";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";

export function Header() {
  return (
    <Container className="bg-1 bg-no-repeat bg-cover grid gap-6 place-items-center h-[25%] md:h-[789px]">
      <div className="flex flex-col-reverse md:flex-row justify-between items-center">
        <div className="md:self-start">
          <Slide duration={300} damping={0.2} cascade triggerOnce>
            <h1 className="text-2xl md:text-3xl font-black max-w-md text-center md:text-left mb-4">
              Launch Your
              <span className="text-blue-700"> Software Engineering</span>{" "}
              Career with
              <span className="text-stone-600"> CASBytes</span>.
            </h1>
            <h2 className="text-xl my-12 font-black max-w-md text-center md:text-left">
              Unleash Your Developer Potential:{" "}
              <span className="text-zinc-700">
                Master Front-End, Back-End, Full-Stack and More
              </span>{" "}
              with CASBytes'
              <span className="text-zinc-700"> Cutting-Edge Curriculum.</span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 capitalize">
              <DialogTrigger asChild>
                <Button aria-label="get started" className="capitalize">
                  get started
                </Button>
              </DialogTrigger>

              <Button variant="outline" aria-label="curriculum" asChild>
                <Link to="/courses">courses</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <li className="flex gap-2 text-center">
                <IoCheckmarkDoneCircle className="text-xl inline" /> Defined
                roadmap
              </li>
              <li className="flex gap-2 text-center">
                <IoCheckmarkDoneCircle className="text-xl inline" /> Structured
                curriculum
              </li>
            </ul>
          </Slide>
        </div>

        <div className="mt-8 md:mt-0">
          <Fade direction="up" triggerOnce>
            <img
              src="https://cdn.casbytes.com/assets/elearning.png"
              alt="elearning"
              width={550}
              height={550}
            />
          </Fade>
        </div>
      </div>
    </Container>
  );
}
