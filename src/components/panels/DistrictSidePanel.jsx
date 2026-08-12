import DistrictStatsList from "./DistrictStatsList";
import ArmedButton from "../ArmedButton";

export default function DistrictSidePanel({
  districtColors,
  results,
  unassignedCount,
  activeDistrictId,
  onSelectDistrict,
  onResetAll,
}) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white p-4 lg:flex">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-gray-900">선거구별 상세 정보</p>
        {unassignedCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700">
            미배정 {unassignedCount}곳
          </span>
        )}
      </div>
      {onSelectDistrict && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold text-gray-400">카드를 눌러 배정할 선거구를 고르세요</p>
          {onResetAll && (
            <ArmedButton
              label="전체 초기화"
              armedLabel="정말 초기화?"
              onConfirm={onResetAll}
              className="shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-600 hover:bg-gray-100"
              armedClassName="shrink-0 whitespace-nowrap rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700"
            />
          )}
        </div>
      )}
      <DistrictStatsList
        districtColors={districtColors}
        results={results}
        columns="grid-cols-1"
        activeDistrictId={activeDistrictId}
        onSelect={onSelectDistrict}
      />
    </aside>
  );
}
