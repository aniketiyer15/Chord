import React, { useState, useEffect } from "react";

function PlaylistApp() {
  const [playlists, setPlaylists] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch playlists on load.
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/playlists");
      const data = await res.json();
      setPlaylists(data);
    } catch (error) {
      console.error(error);
      setMessage("Error fetching playlists.");
    }
  };

  // Create playlist: for simplicity we use a prompt.
  const createPlaylist = async () => {
    const playlistName = prompt("Enter the new playlist name:");
    if (!playlistName) return; // Cancelled
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, playlist_name: playlistName, playlist_type: true })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Playlist created with id ${data.playlist_id}`);
        fetchPlaylists();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Network error: " + error.message);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}?user_id=1`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage("Playlist deleted successfully.");
        fetchPlaylists();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Network error: " + error.message);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Playlist Menu</h1>
      {message && <p>{message}</p>}
      {/* Create Playlist Button */}
      <button onClick={createPlaylist} style={{ marginBottom: "1rem" }}>
        Create Playlist
      </button>
      
      {/* Display All Playlists */}
      <h2>All Playlists</h2>
      {playlists.length > 0 ? (
        <ul>
          {playlists.map((pl) => (
            <li key={pl.playlist_id} style={{ marginBottom: "0.5rem" }}>
              <span style={{ cursor: "pointer", textDecoration: "underline" }}>
                {pl.playlist_name}
              </span>{" "}
              <button onClick={() => deletePlaylist(pl.playlist_id)} style={{ marginLeft: "1rem" }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No playlists found.</p>
      )}
    </div>
  );
}

export default PlaylistApp;
