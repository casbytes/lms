import { IoCloudOfflineOutline } from "react-icons/io5";
import { Container } from "./container";

export function OfflineUI() {
  return (
    <Container className="grid place-items-center mt-12 bg-stone-200 max-w-3xl rounded-md p-12">
      <IoCloudOfflineOutline size={200} className="text-slate-500" />
      <h1 className="text-6xl text-slate-500/80">You're offline!</h1>
      <p className="text-2xl text-slate-500/70">
        Please check your internet connection and try again.
      </p>
    </Container>
  );
}
