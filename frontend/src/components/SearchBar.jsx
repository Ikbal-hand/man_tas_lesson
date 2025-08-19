// frontend/src/components/SearchBar.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css'; // Buat file CSS baru untuk styling

const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder={placeholder || "Cari data..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;