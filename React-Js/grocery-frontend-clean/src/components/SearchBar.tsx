import { useState } from "react";
import "../styles/search.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {query && (
          <button 
            className="clear-btn"
            onClick={() => handleSearch("")}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
