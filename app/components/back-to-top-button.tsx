import React from "react";
import { Button } from "./ui/button";
import { FaChevronUp } from "react-icons/fa6";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = React.useState(false);

  function toggleVisibility() {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  React.useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4"
      size={"icon"}
    >
      <FaChevronUp size={25} />
    </Button>
  ) : null;
}
