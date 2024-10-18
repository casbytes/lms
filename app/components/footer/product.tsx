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
              <Link
                to={item.href}
                prefetch="intent"
                // target={item.target ? item.target : "_self"}
              >
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
  { title: "courses", href: "/#courses" },
  { title: "modules", href: "/#modules" },
  { title: "subscription", href: "/#subscription" },
  { title: "articles", href: "/articles" },
];
