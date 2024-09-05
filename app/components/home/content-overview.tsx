import { Fade } from "react-awesome-reveal";
import { Container } from "../container";
import { cn } from "~/libs/shadcn";
import { Image } from "../image";

export function ContentOverview() {
  return (
    <Container id="overview" className="container mb-8">
      <div className="flex flex-col md:flex-row justify-evenly max-w-6xl mx-auto">
        <Fade direction="up" cascade duration={300}>
          <div className={cn("max-w-md mx-auto")}>
            <h1 className="text-3xl font-bold text-center my-12 md:text-left">
              Transform Your Dreams into Reality:{" "}
              <span className="text-blue-700">
                Unleash Your Full Potential as a Software Engineer.
              </span>
            </h1>

            <ul className="list-disc">
              <li className="opacity-80 mt-8 mb-3">
                <strong>
                  Bridging the Gap Between Passion and Profession:{" "}
                </strong>
                <span className="text-sm">
                  Software engineering doesn&apos;t just offer a career; it
                  allows you to turn your fascination with technology into
                  tangible solutions. Imagine creating user-friendly interfaces,
                  crafting the backend that powers complex applications, or
                  building the next generation of software that shapes our
                  world. With dedication and the right learning platform, you
                  can bridge the gap between your passion for technology and a
                  fulfilling profession.
                </span>
              </li>
              <li className="opacity-80 mb-3">
                <strong>Empowering Growth: </strong>
                <span className="text-sm">
                  Continual learning is the cornerstone of success in software
                  engineering. The field is constantly evolving, and the best
                  engineers are lifelong learners. With a platform like
                  CASBytes, you gain access to a comprehensive curriculum that
                  equips you with the latest skills and knowledge. Whether
                  you&apos;re a complete beginner or a seasoned developer
                  seeking to expand your skillset, you can unlock new abilities
                  and chart your own path within the vast landscape of software
                  engineering.
                </span>
              </li>
              <li className="opacity-80 mb-4">
                <strong>Building a Rewarding Future: </strong>
                <span className="text-sm">
                  Explore diverse courses covering frontend and backend
                  development, full-stack, devops, and system design. This
                  holistic approach ensures that you not only survive but thrive
                  in the dynamic world of real-world software engineering.
                  CASBytes is your gateway to comprehensive mastery, guiding you
                  through every aspect of software development.
                </span>
              </li>
            </ul>
            <h2 className="text-zinc-500 text-2xl">
              Your journey starts here, with CASBytes.
            </h2>
          </div>
          <div>
            <Image
              src="assets/elearning2.png"
              width={500}
              height={500}
              alt="elearning"
              className="mt-8 md:mt-32 mx-auto"
            />
          </div>
        </Fade>
      </div>
    </Container>
  );
}
