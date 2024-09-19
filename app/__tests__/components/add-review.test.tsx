import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { AddReview } from "~/components/add-review";

vi.mock("@remix-run/react", () => ({
  useFetcher: () => ({
    submit: vi.fn(),
    data: null,
  }),
}));

vi.mock("./ui/use-toast", () => ({
  toast: vi.fn(),
}));

describe("AddReview Component", () => {
  const title = "please review this course";
  const user = { name: faker.person.fullName() };
  const course = { title: "CASBytes Course" };
  const module = { title: "CASBytes Module" };
  const setIsDialogOpen = vi.fn();

  it("renders correctly with course", () => {
    render(
      <AddReview
        user={user}
        course={course}
        isDialogOpen={true}
        setIsDialogOpen={setIsDialogOpen}
      />
    );

    expect(screen.getByText(/please review this course/i)).toBeInTheDocument();
    expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
    expect(screen.getByText("Course: React Course")).toBeInTheDocument();
  });

  it("renders correctly with module", () => {
    render(
      <AddReview
        user={user}
        module={module}
        isDialogOpen={true}
        setIsDialogOpen={setIsDialogOpen}
      />
    );

    expect(screen.getByText(/please review this module/i)).toBeInTheDocument();
    expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
    expect(screen.getByText("Module: React Module")).toBeInTheDocument();
  });

  it("shows toast message when rating is less than 1 or description is less than 10 characters", () => {
    render(
      <AddReview
        user={user}
        course={course}
        isDialogOpen={true}
        setIsDialogOpen={setIsDialogOpen}
      />
    );

    userEvent.click(screen.getByText("Submit review"));

    expect(toast).toHaveBeenCalledWith({
      title:
        "Rating must be at least 1 and your review must be at least 10 characters long",
    });
  });

  it("submits the review when rating and description are valid", () => {
    const reviewsFetcher = {
      submit: vi.fn(),
      data: null,
    };

    render(
      <AddReview
        user={user}
        course={course}
        isDialogOpen={true}
        setIsDialogOpen={setIsDialogOpen}
      />
    );

    userEvent.click(screen.getByLabelText("Rating:"));
    userEvent.type(screen.getByPlaceholderText("Tell us what you think..."), {
      target: { value: "Great course!" },
    });

    userEvent.click(screen.getByText("Submit review"));

    expect(reviewsFetcher.submit).toHaveBeenCalledWith(
      {
        rating: 1,
        description: "Great course!",
        itemTitle: "React Course",
        itemType: "course",
        intent: "review",
      },
      { method: "POST", preventScrollReset: true }
    );
  });
});
