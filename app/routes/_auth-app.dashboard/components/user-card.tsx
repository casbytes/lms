import wcb from "~/assets/welcome-back.webp";

export function UserCard({ user }: any) {
  return (
    <article className="bg-sky-300/50 rounded-md p-8 flex flex-col justify-center relative w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">Hi, {user.name}</h1>
        <img
          src="https://cdn.casbytes.com/assets/welcome-back.webp"
          width={200}
          alt="Welcome back"
          className="absolute -z-10 sm:z-10 md:-z-10 lg:z-10 right-2 lg:right-6"
        />
      </div>
      <p className="mt-4">It's good to see you again.</p>
    </article>
  );
}
