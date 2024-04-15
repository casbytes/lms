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
              <Link to={item.href}>{item.title}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const items = [
  { title: "testimonials", href: "/#testimonials" },
  { title: "FAQs", href: "/faqs" },
  { title: "about", href: "/#overview" },
  { title: "courses overview", href: "/#courses" },
];
