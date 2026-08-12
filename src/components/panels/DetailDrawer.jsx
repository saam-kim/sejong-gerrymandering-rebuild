import { useState } from "react";
import DistrictStatsList from "./DistrictStatsList";

export default function DetailDrawer({ districtColors, results, unassignedCount }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-200 bg-white lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-black text-gray-700"
      >
        <span>
          선거구별 상세 정보{" "}
          {unassignedCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700">
              미배정 {unassignedCount}곳
            </span>
          )}
        </span>
        <span className="text-gray-400">{isOpen ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>

      {isOpen && (
        <div className="max-h-64 overflow-y-auto px-4 pb-4">
          <DistrictStatsList districtColors={districtColors} results={results} />
        </div>
      )}
    </div>
  );
}
