import { CgSpinner } from "react-icons/cg";

export function FullPagePendingUI() {
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-60 pointer-events-none"></div>
      <div className="relative">
        <CgSpinner size={150} className="text-white animate-spin" />
      </div>
    </div>
  );
}
