import { Fade } from "react-awesome-reveal";
import { Container } from "../container";
import elearning2 from "~/assets/elearning2.png";

export function ContentOverview() {
  return (
    <Container id="overview" className="mb-8">
      <div className="flex flex-col md:flex-row justify-evenly max-w-6xl mx-auto">
        <Fade cascade>
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center my-12 md:text-left">
              Transform Your Dreams into Reality:{" "}
              <span className="text-blue-700">
                Unleash Your Full Potential as a Software Engineer.
              </span>
            </h1>

            <p className="opacity-80 mt-8 mb-3">
              Embark on a captivating journey through the intricacies of
              computer systems with our unified CASBytes curriculum. Delve into
              the magic that fuels computers, unravel the secrets of their
              operation, and decode the mysteries of the number system.
            </p>
            <p className="opacity-80 mb-3">
              As you progress, you'll ascend to new heights, mastering software
              engineering. Our curriculum is thoughtfully designed to take you
              from the fundamentals to advanced concepts seamlessly.
            </p>
            <p className="opacity-80 mb-4">
              Explore diverse courses covering frontend and backend development,
              full-stack, devops, and system design. This holistic approach
              ensures that you not only survive but thrive in the dynamic world
              of real-world software engineering. CASBytes is your gateway to
              comprehensive mastery, guiding you through every aspect of
              software development.
            </p>
            <h2 className="text-zinc-500 text-2xl">
              Your journey starts here, with CASBytes.
            </h2>
          </div>
          <img
            src="https://cdn.casbytes.com/assets/elearning2.png"
            width={500}
            height={500}
            alt="elearning"
            className="mt-8 md:mt-32 mx-auto"
          />
        </Fade>
      </div>
    </Container>
  );
}
