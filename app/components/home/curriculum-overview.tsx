import { Link } from "@remix-run/react";
import { Zoom } from "react-awesome-reveal";
import { LuBrainCircuit } from "react-icons/lu";
import { LiaBookReaderSolid } from "react-icons/lia";
import { TbWorldBolt } from "react-icons/tb";
import { Container } from "../container";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function CurriculumOverview() {
  return (
    <Container className="bg-2 bg-no-repeat bg-cover" id="curriculum_overview">
      <div className="max-w-2xl flex flex-col items-center justify-center mx-auto gap-6 px-2 py-6">
        <h1 className="text-3xl font-bold mb-8 text-blue-500">
          Curriculum overview
        </h1>
        <Zoom cascade triggerOnce>
          <div className="flex flex-col gap-10">
            {items.map((item, index) => (
              <Card
                key={`item-${index}`}
                aria-label={item.title}
                className="drop-shadow-xl rounded-md bg-white px-4 py-6 mx-auto"
              >
                <CardContent>
                  <div>
                    <div className="text-blue-500 flex justify-center">
                      {item.icon}
                    </div>
                    <h2 className="text-xl text-center font-black my-4">
                      {item.title}
                    </h2>
                  </div>
                  <div>{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Zoom>
        {/* <Link to="/curriculum">
          <Button variant="outline" className="mt-8" aria-label="learn more">
            learn more...
          </Button>
        </Link> */}
      </div>
    </Container>
  );
}

const items = [
  {
    icon: <LuBrainCircuit className="text-[4rem]" />,
    title: "Embark on a Journey into Computer Systems Mastery",
    desc: `
    Embark on a transformative journey into the realm of computer systems mastery at CASBytes. Our educational approach begins by unraveling the intricate tapestry of computer systems, delving deep into the core of computing. Explore the essentials of hardware components and navigate the intricate landscapes of operating systems, all within a single, comprehensive curriculum.
Designed to instill essential knowledge for a thriving software engineering career, our program emphasizes the symbiotic relationship between hardware and operating systems. This approach builds a rock-solid foundation, empowering you to unlock the full potential of modern computing. Join us at CASBytes as we guide you through a holistic educational experience that prepares you for success in the dynamic field of software engineering.`,
  },
  {
    icon: <LiaBookReaderSolid className="text-[4rem]" />,
    title: "Mastering the Spectrum of Software Engineering",
    desc: `
    Our enriched curriculum goes beyond coding, offering a comprehensive spectrum of software engineering courses. Meticulously designed, our program delves deep into the world of programming, covering both low-level and high-level domains. You'll harness the power of low-level programming languages, gaining insights into intricacies that drive optimal performance.

But our journey extends further. CASBytes seamlessly guides you into the realm of non-coding software engineering courses, where you'll acquire a holistic skill set. From project management to system design, our curriculum prepares you to tackle the multifaceted challenges of the software engineering landscape.

CASBytes stands as your gateway to a well-rounded education, ensuring you're ready to excel in both coding and non-coding aspects of software engineering. Join us on this transformative educational adventure, where you'll build a foundation to thrive in the ever-evolving field of software engineering.
    `,
  },
  {
    icon: <TbWorldBolt className="text-[4rem]" />,
    title: "Unlocking Real-World Proficiency",
    desc: `
    At CASBytes, we go beyond theoretical learning to provide you with real-world readiness. Our cutting-edge curriculum is not just centered on acquiring knowledge; it's about hands-on experience and practical application. We bring the professional world to you through immersive exercises, hands-on industry projects, and true-to-life simulations.

Envision yourself tackling challenges and scenarios that mirror the dynamic landscape of software engineering. CASBytes doesn't just teach; we empower you with the confidence and practical skills necessary not only to thrive but to excel in your future career. It's not just about knowledge; it's about developing real-world proficiency that sets you apart in the competitive field of software engineering. Join us at CASBytes for an educational experience that prepares you for success in the professional arena.
    `,
  },
];
