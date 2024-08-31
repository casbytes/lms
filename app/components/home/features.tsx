import { Fade } from "react-awesome-reveal";
import { Container } from "../container";
import { Card, CardContent } from "../ui/card";
import { MdQuiz } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaProjectDiagram } from "react-icons/fa";

export function Features() {
  return (
    <Container className="bg-2 bg-no-repeat bg-cover" id="features">
      <div className="max-w-3xl flex flex-col items-center justify-center mx-auto gap-6 px-2 py-6">
        <h1 className="text-3xl font-bold mb-8 text-blue-500">
          Features overview
        </h1>
        <div className="flex flex-col gap-10">
          <Fade cascade damping={0.3} duration={800}>
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
                  <>{item.desc}</>
                </CardContent>
              </Card>
            ))}
          </Fade>
        </div>
      </div>
    </Container>
  );
}

const items = [
  {
    icon: <MdQuiz className="text-blue-400" size={70} />,
    title: "Tests",
    desc: (
      <>
        <p className="text-center text-slate-600">
          The inclusion of tests at the end of every module and sub-module in
          CASBytes isn&apos;t just about assessment; it&apos;s a powerful tool
          for solidifying your knowledge and propelling you further in your
          software engineering journey. Here&apos;s why:
        </p>
        <ul className="list-disc space-y-2 mt-2">
          <li>
            <strong>Reinforcement Through Practice:</strong>
            <span className="text-sm">
              Tests act as quizzes that challenge you to recall and apply the
              concepts you&apos;ve learned. By actively engaging with the
              material through tests, you strengthen your understanding and move
              information from short-term to long-term memory. This ensures you
              retain crucial knowledge and can confidently apply it when
              building real-world software applications.
            </span>
          </li>
          <li>
            <strong>Identifying Gaps in Knowledge:</strong>
            <span className="text-sm">
              Tests serve as a diagnostic tool, revealing areas where you might
              need additional focus. Struggling with a particular concept? Tests
              pinpoint these weaknesses, allowing you to revisit the learning
              materials, seek clarification, and solidify your understanding
              before moving on. This targeted approach ensures a well-rounded
              foundation in each module before progressing to the next.
            </span>
          </li>
          <li>
            <strong>Building Confidence and Competence:</strong>
            <span className="text-sm">
              Successfully completing tests fosters a sense of accomplishment
              and boosts your confidence in your abilities. As you master
              concepts and progress through the curriculum, these small
              victories build momentum and equip you with the competence to
              tackle more complex challenges in the software engineering field.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: <IoShieldCheckmarkSharp className="text-blue-400" size={70} />,
    title: "Checkpoints",
    desc: (
      <>
        <p className="text-center text-slate-600">
          CASBytes incorporates checkpoints at the end of each module and
          sub-module, acting as more than just progress markers. These
          checkpoints serve as strategic milestones to ensure you&apos;re firmly
          on track towards becoming a well-rounded software engineer.
          Here&apos;s how they benefit your learning:
        </p>
        <ul className="list-disc space-y-2 mt-2">
          <li>
            <strong>Solidifying Your Foundation:</strong>
            <span className="text-sm">
              Checkpoints provide an opportunity to pause, reflect, and assess
              your grasp of the covered material. They might involve hands-on
              exercises, code challenges, or non-coding challenges for fields
              like UI/UX design, that test your understanding. By successfully
              completing these checkpoints, you gain the confidence to move
              forward, knowing you possess a solid foundation for the upcoming
              concepts.
            </span>
          </li>
          <li>
            <strong>Targeted Practice and Review:</strong>
            <span className="text-sm">
              Checkpoints often include practical exercises or projects that
              allow you to apply the learned skills in a simulated environment.
              This hands-on approach reinforces your understanding and helps
              identify areas where you might benefit from further review. By
              revisiting the learning materials or seeking clarification before
              proceeding, you ensure a comprehensive grasp of each module before
              tackling the next challenge.
            </span>
          </li>
          <li>
            <strong>Maintaining Momentum and Motivation:</strong>
            <span className="text-sm">
              Successfully completing checkpoints provides a sense of
              accomplishment, keeping you motivated and engaged throughout the
              learning process. These milestones serve as mini-victories,
              acknowledging your progress and propelling you forward with
              renewed determination. The structured approach with clear
              checkpoints fosters a sense of accomplishment and keeps you on
              track for achieving your software engineering goals.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: <FaProjectDiagram className="text-blue-400" size={70} />,
    title: "Projects",
    desc: (
      <>
        <p className="text-center text-slate-600">
          CASBytes takes your learning a step beyond theory with its capstone
          projects at the end of each course. These projects aren&apos;t just
          assessments; they&apos;re your chance to bring the acquired knowledge
          to life by building real-world applications. Here&apos;s what makes
          these projects so valuable:
        </p>
        <ul className="list-disc space-y-2 mt-2">
          <li>
            <strong>Bridging the Gap Between Learning and Doing:</strong>
            <span className="text-sm">
              Throughout the course, you gain a strong foundation in concepts
              and methodologies. The final project allows you to take those
              learnings and apply them to a practical scenario. By building a
              real-world application, you bridge the gap between theoretical
              knowledge and practical implementation, preparing you for the
              challenges and workflows encountered in professional settings.
            </span>
          </li>
          <li>
            <strong>Building a Portfolio Showcase:</strong>
            <span className="text-sm">
              The completed projects serve as a tangible testament to your
              skills and problem-solving abilities. They become valuable
              additions to your portfolio, showcasing your proficiency to
              potential employers. These projects demonstrate your capacity to
              not only grasp concepts but also translate them into functional
              applications, making you a more competitive candidate in the job
              market.
            </span>
          </li>
          <li>
            <strong>
              Experiencing the Full Software Development Lifecycle:{" "}
            </strong>
            <span className="text-sm">
              CASBytes&apos; project-based approach allows you to experience the
              entire software development lifecycle (SDLC). You&apos;ll likely
              go through the processes of planning, design, development,
              testing, and deployment, giving you a holistic understanding of
              how software applications come to life. This comprehensive
              experience prepares you for the collaborative and dynamic nature
              of real-world software development teams.
            </span>
          </li>
        </ul>
      </>
    ),
  },
];
