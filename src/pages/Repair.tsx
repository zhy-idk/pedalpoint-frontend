import { useState } from "react";
import { DayPicker } from "react-day-picker";

function Repair(){
  const [date, setDate] = useState<Date | undefined>();
  return(
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <span>Schedule a repair</span>
        <button popoverTarget="rdp-popover" className="input input-border" style={{ anchorName: "--rdp" } as React.CSSProperties}>
          {date ? date.toLocaleDateString() : "Pick a date"}
        </button>
        <div popover="auto" id="rdp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
          <DayPicker className="react-day-picker" mode="single" selected={date} onSelect={setDate} />
        </div>
        <div className="mt-4">
          <button className="btn btn-primary" onClick={() => alert(`Repair scheduled for ${date?.toLocaleDateString()}`)}>
            Schedule Repair
          </button>
        </div>
      </div>
    </>
  )
}
export default Repair