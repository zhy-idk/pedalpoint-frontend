import { useProductDetail } from "../hooks/useProductDetail";

function StarFilter(){
  const { state, actions } = useProductDetail();
  const selectedFilter = state.selectedStarFilter;

  const handleFilterChange = (rating: number | null) => {
    actions.setStarFilter(rating);
  };

  return(
    <div className="filter">
      <input 
        className="btn btn-sm btn-neutral filter-reset xs:btn-md" 
        type="radio" 
        name="metaframeworks" 
        checked={selectedFilter === null} 
        onChange={() => handleFilterChange(null)} 
        aria-label="All"
      />
      <input 
        className="btn btn-sm xs:btn-md" 
        type="radio" 
        name="metaframeworks" 
        checked={selectedFilter === 5} 
        onChange={() => handleFilterChange(5)} 
        aria-label="5 star"
      />
      <input 
        className="btn btn-sm xs:btn-md" 
        type="radio" 
        name="metaframeworks" 
        checked={selectedFilter === 4} 
        onChange={() => handleFilterChange(4)} 
        aria-label="4 star"
      />
      <input 
        className="btn btn-sm xs:btn-md" 
        type="radio" 
        name="metaframeworks" 
        checked={selectedFilter === 3} 
        onChange={() => handleFilterChange(3)} 
        aria-label="3 star"
      />
      <input 
        className="btn btn-sm xs:btn-md" 
        type="radio" 
        name="metaframeworks" 
        checked={selectedFilter === 2} 
        onChange={() => handleFilterChange(2)} 
        aria-label="2 star"
      />
      <input 
        className="btn btn-sm xs:btn-md" 
        type="radio" 
        name="metaframeworks" 
        onChange={() => handleFilterChange(1)} 
        aria-label="1 star"
        checked={selectedFilter === 1}
      />
    </div>
  )
}

export default StarFilter