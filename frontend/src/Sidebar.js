// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ playlists = [] }) => {
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/" className="nav-item">Home</NavLink>
        <NavLink to="/playlists" className="nav-item">Your Library</NavLink>
      </nav>
      <hr className="divider" />
      <div className="playlist-preview">
        <h4>Your Playlists</h4>
        {Array.isArray(playlists) && playlists.length > 0 ? (
          playlists.map(p => (
            <NavLink
              key={p.playlist_id}
              to={`/playlists/${p.playlist_id}`}
              className="playlist-item"
            >
              {p.playlist_name}
            </NavLink>
          ))
        ) : (
          <p>No playlists</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
