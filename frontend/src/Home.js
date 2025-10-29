// src/Home.js
import React, { useEffect, useState } from "react";
import MusicCard from "./MusicCard";
import { Link } from "react-router-dom";

export default function Home({ updateNowPlaying, loggedInUser }) {
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [songTracks, setSongTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRecommendations = async () => {
    const res = await fetch("/api/home-recommendations");
    if (!res.ok) throw new Error("Failed to load recommendations");
    const data = await res.json();
    const addArt = (item) => ({
      ...item,
      artwork: `https://picsum.photos/seed/${item.id}/200/200`,
    });
    return {
      recommendedSong: { tracks: data.songs.map(addArt) },
      recommendedAlbum: { tracks: data.albums.map(addArt) },
      recommendedPlaylist: { tracks: data.genres.map(addArt) },
    };
  };

  useEffect(() => {
    getRecommendations().then((data) => {
      const addArt = (item) => ({
        ...item,
        artwork: `https://picsum.photos/seed/${item.id}/200/200`,
      });
      setPlaylistTracks(
        (data.recommendedPlaylist.tracks || []).slice(0, 3).map(addArt)
      );
      setAlbumTracks(
        (data.recommendedAlbum.tracks || []).slice(0, 3).map(addArt)
      );
      setSongTracks(
        (data.recommendedSong.tracks || []).slice(0, 3).map(addArt)
      );
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  };

  return (
    <div style={{ padding: "1rem" }}>
      {loggedInUser && (
        <div
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            color: "#333",
          }}
        >
          Welcome back,{" "}
          <span
            style={{
              color: "#2b6cb0",
              fontWeight: "bold",
            }}
          >
            {loggedInUser.user_name}
          </span>
          !
        </div>
      )}

      {/* Album Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>Albums</h3>
        <div style={gridStyle}>
          {albumTracks.map((track) => (
            <Link
              key={track.id}
              to={`/albums/${track.id}`}
              style={{ textDecoration: "none" }}
            >
              <MusicCard track={track} />
            </Link>
          ))}
        </div>
      </section>

      {/* Song Recommendations */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>
          Song Recommendations
        </h3>
        <div style={gridStyle}>
          {songTracks.map((track) => (
            <MusicCard
              key={track.id}
              track={track}
              updateNowPlaying={updateNowPlaying}
            />
          ))}
        </div>
      </section>

      {/* Genre Section */}
      <section>
        <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>Genres</h3>
        <div style={gridStyle}>
          {playlistTracks.map((track) => (
            <MusicCard key={track.id} track={track} />
          ))}
        </div>
      </section>
    </div>
  );
}
