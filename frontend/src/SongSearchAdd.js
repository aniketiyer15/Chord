import React, { useState } from "react";

export default function SongSearchAdd({ playlistId, onSongAdded }) {
  const [term, setTerm]     = useState("");
  const [results, setRes]   = useState([]);
  const [status, setStatus] = useState("");

  // live search
  const search = async (q) => {
    setTerm(q);
    if (!q.trim()) return setRes([]);
    const r   = await fetch(`/api/songs?query=${encodeURIComponent(q)}`);
    const arr = await r.json();
    setRes(arr);
  };

  // add song
  const add = async (songId) => {
    const r = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song_id: songId })
    });
    const data = await r.json();
    if (r.ok) {
      setStatus("✅ Added.");
      setRes([]);
      setTerm("");
      onSongAdded();
    } else {
      setStatus(`❌ ${data.error}`);
    }
  };

  return (
    <div>
      <input
        placeholder="Search DB songs…"
        value={term}
        onChange={e => search(e.target.value)}
        style={{ width: 250 }}
      />
      {results.length > 0 && (
        <ul style={{ marginTop: 8 }}>
          {results.map(s => (
            <li key={s.song_id}>
              {s.title} — {s.artist_name || "Unknown"}
              <button style={{ marginLeft: 8 }} onClick={() => add(s.song_id)}>
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
      {status && <p>{status}</p>}
    </div>
  );
}
