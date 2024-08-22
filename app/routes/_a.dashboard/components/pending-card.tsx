import { ImSpinner2 } from "react-icons/im";

export function PendingCard() {
  return (
    <div className="w-full flex items-center justify-center p-14 bg-indigo-200/30 rounded-md">
      <ImSpinner2 size={45} className="animate-spin text-slate-600 " />
    </div>
  );
}
