import { AiOutlineDollarCircle } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa6";
import { IoPersonCircleSharp } from "react-icons/io5";
import { ICurrentUser } from "~/constants/types";

export function UserOverview({ user }: { user: ICurrentUser }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 md:mt-20 bg-sky-200 rounded-md p-2">
      <div className="flex justify-start sm:justify-between gap-6 flex-wrap items-center">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full"
            alt={user.name}
          />
        ) : (
          <IoPersonCircleSharp className="h-12 w-12 text-sky-700" />
        )}
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
