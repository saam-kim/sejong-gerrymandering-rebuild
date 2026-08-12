import DistrictStatsList from "./DistrictStatsList";

export default function DistrictSidePanel({ districtColors, results, unassignedCount }) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white p-4 lg:flex">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-gray-900">선거구별 상세 정보</p>
        {unassignedCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700">
            미배정 {unassignedCount}곳
          </span>
        )}
      </div>
      <DistrictStatsList districtColors={districtColors} results={results} columns="grid-cols-1" />
    </aside>
  );
}
