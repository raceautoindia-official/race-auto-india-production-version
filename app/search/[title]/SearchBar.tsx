'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap'; // Import React Bootstrap components
import { FaSearch } from 'react-icons/fa'; // Import the React Icons library for the search icon

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      router.push(`/search/${search}`);
    }
  };

  const handleSearchClick = () => {
    if (search.trim() !== '') {
      router.push(`/search/${search}`);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <InputGroup>
        <FormControl
          type="search"
          placeholder="Search here for articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="primary"
          style={{ borderRadius: 0 }}
          onClick={handleSearchClick}
        >
          <FaSearch /> {/* React Icons Search icon */}
        </Button>
      </InputGroup>
    </div>
  );
};

export default SearchBar;
