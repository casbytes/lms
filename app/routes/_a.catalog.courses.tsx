import { defer } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/back-button";
import { MetaCourses } from "~/components/catalog/meta-courses";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getMetaCourses } from "~/services/sanity/index.server";

export async function loader() {
  try {
    return defer({ courses: getMetaCourses() });
  } catch (error) {
    throw error;
  }
}

export default function CourseCatalogRoute() {
  const { courses } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-6xl">
      <BackButton to="/dashboard" buttonText="dashboard" />
      <PageTitle title="courses" className="mb-6" />
      <MetaCourses courses={courses} />
    </Container>
  );
}
