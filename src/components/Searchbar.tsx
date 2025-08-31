import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";

function Searchbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Popular search terms
  const popularSearches = ["bikes", "mountain", "road", "components", "brand a"];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search submission
  const handleSearch = (term: string) => {
    if (term.trim()) {
      saveSearch(term.trim());
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      setShowSuggestions(false);
    }
  };

  // Handle input change with auto-submit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for auto-submit
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (term: string) => {
    setSearchTerm(term);
    saveSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <input
          type="search"
          placeholder="Search products..."
          className="input w-full input-sm md:input-md pr-4"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-base-300">
              <h4 className="text-sm font-semibold text-base-content/70 mb-2">Recent Searches</h4>
              <div className="space-y-1">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-base-200 rounded flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-base-content/50" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="p-3">
            <h4 className="text-sm font-semibold text-base-content/70 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Popular Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(term)}
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Searchbar;