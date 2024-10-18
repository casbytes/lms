import { Link } from "@remix-run/react";
import { Button } from "../ui/button";
import { Title } from "./title";

export function About() {
  return (
    <div>
      <Title title="About" className="mt-0" />
      <ul>
        {items.map((item) => (
          <li key={item.title}>
            <Button variant="link" className="-my-1 capitalize p-0" asChild>
              <Link to={item.href} prefetch="intent">
                {item.title}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const items = [
  { title: "features", href: "/#features" },
  { title: "overview", href: "/#overview" },
  { title: "testimonials", href: "/#testimonials" },
  { title: "FAQs", href: "/faqs" },
];
