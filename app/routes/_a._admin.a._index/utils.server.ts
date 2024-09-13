import invariant from "tiny-invariant";
import { Prisma, prisma } from "~/utils/db.server";
import { INTENT } from "./components/user-dialog";
import { Paystack } from "~/services/paystack.server";
import { constructUsername } from "~/utils/helpers.server";
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
      // eslint-disable-next-line no-undefined
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
  const { intent, userId, name, githubUsername, email, role, membership } =
    await getFormData(request);
  invariant(intent, "Intent is required.");
  const user = await getUser(userId);
  const subscribed = membership === "free" ? false : true;

  switch (intent) {
    case INTENT.DELETE_USER: {
      try {
        await prisma.user.delete({ where: { id: userId } });
        return null;
      } catch (error) {
        throw error;
      }
    }
    case INTENT.UPDATE_USER: {
      try {
        const userData = { name, githubUsername, email, role, subscribed };
        const { firstName, lastName } = constructUsername(userData.name);
        await Promise.all([
          await Paystack.updateCustomer(user!.paystackCustomerCode!, {
            email: userData.email,
            first_name: firstName,
            last_name: lastName,
          }),
          prisma.user.update({ where: { id: userId }, data: { ...userData } }),
        ]);
        return null;
      } catch (error) {
        throw error;
      }
    }

    default:
      throw new Error("Invalid intent.");
  }
}

async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, paystackCustomerCode: true },
  });
}

async function getFormData(request: Request) {
  const formData = await request.formData();
  return {
    intent: formData.get("intent") as string,
    userId: formData.get("userId") as string,
    name: formData.get("name") as string,
    githubUsername: formData.get("githubUsername") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
    membership: formData.get("membership") as string,
  };
}
