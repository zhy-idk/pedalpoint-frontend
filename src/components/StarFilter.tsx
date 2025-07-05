import { useState } from "react";

function StarFilter(){
  const [selectedFilter, setSelectedFilter] = useState("all");
  console.log(selectedFilter)

  return(
    <div className="filter">
      <input className="btn btn-sm btn-neutral filter-reset xs:btn-md" type="radio" name="metaframeworks" checked={selectedFilter === "all"} onChange={() => setSelectedFilter("all")} aria-label="All"/>
      <input className="btn btn-sm xs:btn-md" type="radio" name="metaframeworks" checked={selectedFilter === "5 star"} onChange={() => setSelectedFilter("5 star")} aria-label="5 star"/>
      <input className="btn btn-sm xs:btn-md" type="radio" name="metaframeworks" checked={selectedFilter === "4 star"} onChange={() => setSelectedFilter("4 star")} aria-label="4 star"/>
      <input className="btn btn-sm xs:btn-md" type="radio" name="metaframeworks" checked={selectedFilter === "3 star"} onChange={() => setSelectedFilter("3 star")} aria-label="3 star"/>
      <input className="btn btn-sm xs:btn-md" type="radio" name="metaframeworks" checked={selectedFilter === "2 star"} onChange={() => setSelectedFilter("2 star")} aria-label="2 star"/>
      <input className="btn btn-sm xs:btn-md" type="radio" name="metaframeworks" checked={selectedFilter === "1 star"} onChange={() => setSelectedFilter("1 star")} aria-label="1 star"/>
    </div>
  )
}

export default StarFilter