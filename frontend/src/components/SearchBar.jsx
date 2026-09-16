import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, onClear, totalCount, filteredCount }) => {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          id="student-search-input"
          type="text"
          className="search-input"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search students by name, register number, department, or email"
        />
        {searchTerm && (
          <button
            type="button"
            id="clear-search-btn"
            className="clear-search-btn"
            onClick={onClear}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="search-stats" id="search-stats-badge">
          Showing {filteredCount} of {totalCount} students
        </div>
      )}
    </div>
  );
};

export default SearchBar;
