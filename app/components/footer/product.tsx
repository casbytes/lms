import { Link } from "@remix-run/react";
import { Button } from "../ui/button";
import { Title } from "./title";

export function Product() {
  return (
    <div>
      <Title title="Product" />
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
  { title: "courses", href: "/courses" },
  { title: "subscription", href: "/#subscription" },
  { title: "blog", href: "blog.casbytes.com" },
];
