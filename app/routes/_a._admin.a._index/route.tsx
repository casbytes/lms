import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { UserTable } from "./components/user-table";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { countUsers, getPageData, updateUser } from "./utils.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const pageData = await getPageData(request);
  const totalUsers = await countUsers();
  return { pageData, totalUsers };
}

export async function action({ request }: ActionFunctionArgs) {
  return await updateUser(request);
}

export default function UsersRoute() {
  const { pageData, totalUsers } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-5xl">
      <PageTitle title="users" />
      <UserTable pageData={pageData} totalUsers={totalUsers} />
    </Container>
  );
}
