import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSortAmountDown, 
  faSortAmountUp,
  faTimes,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const SearchAndFilter = ({ 
  data = [], 
  onFilteredData, 
  searchFields = [], 
  filterOptions = {},
  sortOptions = {},
  placeholder = "Rechercher...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  const filtersRef = useRef(null);
  const sortRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort data
  useEffect(() => {
    let filteredData = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filteredData = filteredData.filter(item =>
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        filteredData = filteredData.filter(item => {
          const value = getNestedValue(item, filterKey);
          return value === filterValue;
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      filteredData.sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    onFilteredData(filteredData);
  }, [data, searchTerm, activeFilters, sortBy, sortOrder, searchFields, onFilteredData]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilter = (filterKey) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setSortBy('');
    setSortOrder('asc');
  };

  const activeFilterCount = Object.keys(activeFilters).length + (searchTerm ? 1 : 0);

  return (
    <div className={`search-filter-container ${className}`}>
      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search-btn"
              aria-label="Effacer la recherche"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="filter-sort-controls">
        {/* Filters Dropdown */}
        {Object.keys(filterOptions).length > 0 && (
          <div className="filter-dropdown" ref={filtersRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Filtres</span>
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`chevron ${showFilters ? 'rotated' : ''}`}
              />
            </button>

            {showFilters && (
              <div className="filter-dropdown-content">
                <div className="filter-header">
                  <h4>Filtres</h4>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="clear-all-btn">
                      Tout effacer
                    </button>
                  )}
                </div>

                {Object.entries(filterOptions).map(([filterKey, options]) => (
                  <div key={filterKey} className="filter-group">
                    <label className="filter-label">{options.label}</label>
                    <select
                      value={activeFilters[filterKey] || 'all'}
                      onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">Tous</option>
                      {options.values.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sort Dropdown */}
        {Object.keys(sortOptions).length > 0 && (
          <div className="sort-dropdown" ref={sortRef}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className={`sort-btn ${sortBy ? 'has-sort' : ''}`}
            >
              <FontAwesomeIcon 
                icon={sortOrder === 'asc' ? faSortAmountUp : faSortAmountDown} 
              />
              <span>Trier</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`chevron ${showSortOptions ? 'rotated' : ''}`}
              />
            </button>

            {showSortOptions && (
              <div className="sort-dropdown-content">
                <div className="sort-header">
                  <h4>Trier par</h4>
                </div>

                {Object.entries(sortOptions).map(([sortKey, label]) => (
                  <button
                    key={sortKey}
                    onClick={() => {
                      if (sortBy === sortKey) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(sortKey);
                        setSortOrder('asc');
                      }
                      setShowSortOptions(false);
                    }}
                    className={`sort-option ${sortBy === sortKey ? 'active' : ''}`}
                  >
                    <span>{label}</span>
                    {sortBy === sortKey && (
                      <FontAwesomeIcon 
                        icon={sortOrder === 'asc' ? faSortAmountUp : faSortAmountDown}
                        className="sort-indicator"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="active-filters">
          {Object.entries(activeFilters).map(([filterKey, filterValue]) => {
            const filterOption = filterOptions[filterKey];
            const valueLabel = filterOption?.values.find(v => v.value === filterValue)?.label || filterValue;
            
            return (
              <div key={filterKey} className="active-filter-tag">
                <span className="filter-tag-label">
                  {filterOption?.label}: {valueLabel}
                </span>
                <button
                  onClick={() => clearFilter(filterKey)}
                  className="remove-filter-btn"
                  aria-label={`Supprimer le filtre ${filterOption?.label}`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;