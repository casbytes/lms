import { AiOutlineDollarCircle } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa6";
import { IoPersonCircleSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ICurrentUser } from "~/constants/types";

export function UserOverview({ user }: { user: ICurrentUser }) {
  const avatarFallBack = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 md:mt-20 bg-sky-200 rounded-md p-2">
      <div className="flex justify-start sm:justify-between gap-6 flex-wrap items-center">
        <Avatar>
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback>{avatarFallBack}</AvatarFallback>
        </Avatar>
        <p className="text-2xl">{user.name}</p>
      </div>

      <div className="flex gap-6 justify-start sm:justify-between items-center">
        {user.authType === "github" ? (
          <div className="bg-gray-600 rounded-md p-4 text-white text-lg h-10 flex items-center">
            <FaGithub className="mr-2 h-6 w-6" /> Github
          </div>
        ) : (
          <div className="bg-red-400 rounded-md p-4 text-white text-lg h-10 flex items-center">
            <FaGoogle className="mr-2 h-6 w-6" />
            Google
          </div>
        )}

        <div className="bg-sky-600 rounded-md p-4 text-white text-lg h-10 flex items-center">
          <AiOutlineDollarCircle className="mr-2 h-6 w-6" /> Premium
        </div>
        {/* <div className="bg-slate-500 rounded-md p-4 text-white text-lg h-10 flex items-center">
              <FaHeart className="mr-2 h-6 w-6" />
              Free
            </div> */}
      </div>
    </div>
  );
}
