import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Playlist.css"; // same CSS file

export default function PlaylistList({ user, onPlaylistCreated }) {
  const [playlists, setPlaylists] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`/api/playlists?user_id=${user.user_id}`);
      setPlaylists(await res.json());
    } catch {
      console.error("Error loading playlists");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        playlist_name: newName,
        playlist_type: true,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Created playlist #${data.playlist_id}`);
      setNewName("");
      load();
      onPlaylistCreated?.();
    } else {
      setMsg(data.error || "Failed to create");
    }
  };

  const visible = playlists.filter((p) =>
    p.playlist_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pl-container">
      <h2 className="pl-title">All Playlists</h2>
      {msg && <div className="pl-message">{msg}</div>}

      <input
        className="pl-search"
        placeholder="Search playlists…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {visible.length === 0 ? (
        <p className="pl-empty">No playlists match.</p>
      ) : (
        <ul className="pl-list">
          {visible.map((p) => (
            <li key={p.playlist_id} className="pl-item">
              <Link to={`/playlists/${p.playlist_id}`} className="pl-link">
                {p.playlist_name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <hr className="pl-hr" />

      <div className="pl-create">
        <h3 className="pl-subtitle">Create new playlist</h3>
        <div className="pl-create-row">
          <input
            className="pl-input"
            placeholder="Playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="pl-btn" onClick={create}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
