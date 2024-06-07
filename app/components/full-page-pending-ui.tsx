import { PiSpinnerGapLight } from "react-icons/pi";

export function FullPagePendingUI() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <PiSpinnerGapLight size={50} className="text-slate-200 animate-spin" />
    </div>
  );
}
