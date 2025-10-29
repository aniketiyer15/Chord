import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SongSearchAdd from "./SongSearchAdd";
import "./Playlist.css"; // make sure this file is imported

export default function PlaylistView({ loggedInUser, onPlaylistUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pl, setPl] = useState(null);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setPl(data);
      setNewName(data.playlist_name);
    } catch {
      setMsg("Failed to load playlist.");
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDeleteSong = async (songId) => {
    try {
      const res = await fetch(`/api/playlists/${id}/songs/${songId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setMsg("Song deleted");
      load();
    } catch {
      setMsg("Failed to delete song.");
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const res = await fetch(
        `/api/playlists/${id}?user_id=${loggedInUser.user_id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setMsg("Playlist deleted");
      onPlaylistUpdate?.();
      navigate("/playlists");
    } catch {
      setMsg("Failed to delete playlist.");
    }
  };

  const handleRenamePlaylist = async () => {
    try {
      const res = await fetch(`/api/playlists/${id}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_name: newName }),
      });
      if (!res.ok) throw new Error();
      setMsg("Renamed successfully");
      setEditing(false);
      onPlaylistUpdate?.();
      load();
    } catch {
      setMsg("Failed to rename playlist.");
    }
  };

  if (!pl) return <p className="pv-loading">Loading…</p>;

  return (
    <div className="pv-container">
      {msg && <div className="pv-message">{msg}</div>}

      <div className="pv-breadcrumb">
        <Link to="/playlists">&larr; Back to all playlists</Link>
      </div>

      <div className="pv-header">
        {editing ? (
          <div className="pv-edit-row">
            <input
              className="pv-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button className="pv-btn pv-btn-save" onClick={handleRenamePlaylist}>
              Save
            </button>
            <button
              className="pv-btn pv-btn-cancel"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h2 className="pv-title">{pl.playlist_name}</h2>
            <button className="pv-btn pv-btn-edit" onClick={() => setEditing(true)}>
              Rename
            </button>
          </>
        )}
      </div>

      <p className="pv-stats">
        {pl.total_songs} song(s) • {pl.total_duration}s{" "}
        <button className="pv-btn pv-btn-delete" onClick={handleDeletePlaylist}>
          Delete Playlist
        </button>
      </p>

      <h3 className="pv-subheader">Songs</h3>
      {pl.songs.length === 0 ? (
        <p className="pv-empty">No songs in this playlist yet.</p>
      ) : (
        <ul className="pv-song-list">
          {pl.songs.map((s) => (
            <li key={s.song_id} className="pv-song-item">
              <span>
                {s.title} — {s.artist_name || "Unknown"} ({s.duration}s)
              </span>
              <button
                className="pv-btn pv-btn-delete-small"
                onClick={() => handleDeleteSong(s.song_id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="pv-subheader">Add a Song</h3>
      <SongSearchAdd
        playlistId={id}
        onSongAdded={() => {
          setMsg("Song added!");
          load();
        }}
      />
    </div>
  );
}
