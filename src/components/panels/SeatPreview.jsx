import { PARTIES } from "../../data/sejongAreas";

export default function SeatPreview({ seats, size = "md" }) {
  const isSmall = size === "sm";
  return (
    <div className="flex items-center gap-1.5">
      {PARTIES.map((party) => (
        <div
          key={party.id}
          className={`flex flex-col items-center rounded-lg ${isSmall ? "min-w-[44px] px-2 py-1" : "min-w-[60px] px-3 py-1.5"}`}
          style={{ background: party.soft }}
        >
          <span
            className={`${isSmall ? "text-base" : "text-2xl"} font-black leading-none`}
            style={{ color: party.color }}
          >
            {seats[party.id] || 0}
          </span>
          <span className="text-[9px] font-extrabold text-gray-500">{party.shortName}</span>
        </div>
      ))}
    </div>
  );
}
