import { Prisma, prisma } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";
//#################
//LOADER UTILS
//################

type SortType = Prisma.SortOrder | undefined;

export async function getPageData(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const asc = "asc";
  const search = searchParams.get("search") ?? "";
  const emailOrder = (searchParams.get("emailOrder") ?? asc) as SortType;
  const nameOrder = (searchParams.get("nameOrder") ?? asc) as SortType;

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);

  const orderBy: Prisma.UserOrderByWithRelationInput[] = [];
  if (emailOrder) {
    orderBy.push({ email: emailOrder });
  }
  if (nameOrder) {
    orderBy.push({ name: nameOrder });
  }

  const [users, currentTotalUsers] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search.toLowerCase() } },
          { name: { contains: search.toLowerCase() } },
        ],
      },
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({
      where: {
        OR: [
          { email: { contains: search.toLowerCase() } },
          { name: { contains: search.toLowerCase() } },
        ],
      },
    }),
  ]);

  return {
    users,
    currentTotalUsers,
    pageSize,
    currentPage: page,
    rowsPerPage: pageSize,
    totalPages: Math.ceil(currentTotalUsers / pageSize),
  };
}

/**
 * Total number of CASBytes users
 * @returns {Promise<number>} - number of users
 */
export async function countUsers() {
  return prisma.user.count();
}

//#################
//ACTION UTILS
//################
export async function updateUser(request: Request) {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const userDetails = [name, role, email];
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...userDetails,
    },
  });

  return null;
}
