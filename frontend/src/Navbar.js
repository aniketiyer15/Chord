import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFilter, FaSearch, FaUserCircle } from 'react-icons/fa';
import './App.css';  // <-- Add this line if not already added

const Navbar = ({ toggleTheme, darkMode, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const openSettings = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  const handleLogout = () => {
    setIsFadingOut(true);  // start fade-out
    localStorage.removeItem("loggedInUser");
    setTimeout(() => {
      setShowDropdown(false);
      setIsFadingOut(false);
      onLogout();
      navigate('/');
    }, 400); // Match with CSS animation duration
  };

  return (
    <nav className="navbar flex items-center justify-between p-4 bg-white dark:bg-gray-800">
      {/* Brand */}
      <div className="nav-left">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Chord
        </Link>
      </div>

      {/* Search */}
      <div className="nav-center flex items-center space-x-2">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <input
            type="text"
            className="border rounded-full py-1 px-3 focus:outline-none"
            placeholder="Search songs, albums…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="ml-2 p-2 hover:bg-blue-700 rounded-full">
            <FaSearch size={14} />
          </button>
        </form>
      </div>

      {/* Theme & User */}
      <div className="relative nav-right flex items-center space-x-4">

        <button
          onClick={() => setShowDropdown(prev => !prev)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <FaUserCircle size={24} />
        </button>

        {showDropdown && (
          <div className={`dropdown-menu ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
            <button onClick={openSettings}>Settings</button>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
