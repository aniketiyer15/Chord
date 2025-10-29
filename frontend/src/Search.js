import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Search = ({ updateNowPlaying, loggedInUser }) => {
  const [results, setResults] = useState(null);
  const [followingIds, setFollowingIds] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAudiobooks, setLikedAudiobooks] = useState([]);
  const [likedPodcasts, setLikedPodcasts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    if (!query) return setResults(null);
    const fetchResults = async () => {
      try {
        // const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&user_id=${
            loggedInUser.user_id
          }`
        );

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Failed to fetch search results", err);
      }
    };
    fetchResults();
  }, [query]);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchLiked = async () => {
      try {
        const [songRes, abRes, pcRes] = await Promise.all([
          fetch(`/api/liked-songs?user_id=${loggedInUser.user_id}`),
          fetch(`/api/liked-audiobooks?user_id=${loggedInUser.user_id}`),
          fetch(`/api/liked-podcasts?user_id=${loggedInUser.user_id}`),
        ]);
        const [songs, audiobooks, podcasts] = await Promise.all([
          songRes.json(),
          abRes.json(),
          pcRes.json(),
        ]);
        setLikedSongs(songs.map((s) => s.song_id));
        setLikedAudiobooks(audiobooks.map((a) => a.audiobook_id));
        setLikedPodcasts(podcasts.map((p) => p.podcast_id));
      } catch (err) {
        console.error("Error loading liked media", err);
      }
    };

    const fetchFollowing = async () => {
      try {
        const res = await fetch(
          `/api/following?user_id=${loggedInUser.user_id}`
        );
        const data = await res.json();
        setFollowingIds(data.map((f) => f.id)); // ✅ fixed: use .id not .user_id
      } catch (err) {
        console.error("Error fetching following list", err);
      }
    };

    fetchLiked();
    fetchFollowing();
  }, [loggedInUser, results]);

  const handleFollowToggle = async (userIdToFollow) => {
    const isFollowing = followingIds.includes(userIdToFollow);
    const endpoint = isFollowing ? "/api/unfollow" : "/api/follow";

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userIdToFollow,
          follower_id: loggedInUser?.user_id,
        }),
      });
      setFollowingIds((prev) =>
        isFollowing
          ? prev.filter((id) => id !== userIdToFollow)
          : [...prev, userIdToFollow]
      );
    } catch (err) {
      console.error("Follow toggle failed", err);
    }
  };

  const toggleLike = async (type, id, isLiked) => {
    const endpoints = {
      song: ["/api/like-song", "/api/unlike-song", setLikedSongs, likedSongs],
      audiobook: [
        "/api/like-audiobook",
        "/api/unlike-audiobook",
        setLikedAudiobooks,
        likedAudiobooks,
      ],
      podcast: [
        "/api/like-podcast",
        "/api/unlike-podcast",
        setLikedPodcasts,
        likedPodcasts,
      ],
    };

    const [likeUrl, unlikeUrl, setLiked, likedArray] = endpoints[type];

    try {
      const res = await fetch(isLiked ? unlikeUrl : likeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          [`${type}_id`]: id,
        }),
      });
      if (!res.ok) throw new Error("Like/unlike failed");

      setLiked((prev) =>
        isLiked ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } catch (err) {
      console.error(`Error toggling like for ${type}`, err);
    }
  };

  const sectionStyle = { marginBottom: "2rem" };
  const scrollContainerStyle = {
    display: "flex",
    overflowX: "auto",
    gap: "1rem",
    paddingBottom: "0.5rem",
  };
  const cardStyle = {
    minWidth: "160px",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#fff",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    position: "relative",
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Search Results for "{query}"</h2>

      {results ? (
        <>
          {results.users?.length > 0 && (
            <section style={sectionStyle}>
              <h3>Users</h3>
              <div style={scrollContainerStyle}>
                {results.users.map((user) => {
                  const isSelf = user.id === loggedInUser?.user_id;
                  const isFollowing = followingIds.includes(user.id);

                  return (
                    <div key={user.id} style={cardStyle}>
                      <div style={{ fontWeight: "bold" }}>{user.name}</div>
                      <div style={{ fontSize: "0.9rem", color: "#888" }}>
                        {user.email}
                      </div>
                      {!isSelf && (
                        <button
                          onClick={() => handleFollowToggle(user.id)}
                          style={{
                            marginTop: "0.5rem",
                            padding: "4px 8px",
                            cursor: "pointer",
                            backgroundColor: isFollowing ? "#ddd" : "#007bff",
                            color: isFollowing ? "#000" : "#fff",
                            border: "none",
                            borderRadius: "4px",
                          }}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {results.albums?.length > 0 && (
            <section style={sectionStyle}>
              <h3>Albums</h3>
              <div style={scrollContainerStyle}>
                {results.albums.map((album) => (
                  <div
                    key={album.id}
                    style={cardStyle}
                    onClick={() => navigate(`/albums/${album.id}`)}
                  >
                    <img
                      src={`https://picsum.photos/seed/album${album.id}/200/200`}
                      alt={album.title}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "0.5rem",
                      }}
                    />
                    <div style={{ fontWeight: "bold" }}>{album.title}</div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {album.artist || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SONGS */}
          {results.songs?.length > 0 && (
            <section style={sectionStyle}>
              <h3>Songs</h3>
              <div style={scrollContainerStyle}>
                {results.songs.map((song) => {
                  const isLiked = likedSongs.includes(song.id);
                  return (
                    <div key={song.id} style={cardStyle}>
                      <img
                        src={`https://picsum.photos/seed/song${song.id}/200/200`}
                        alt={song.title}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "0.5rem",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          updateNowPlaying?.({ ...song, type: "song" })
                        }
                      />
                      <div style={{ fontWeight: "bold" }}>{song.title}</div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        {song.artist || "Unknown"}
                      </div>
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(song.id);
                          toggleLike("song", song.id, isLiked);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "transparent",
                          border: "none",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                          color: isLiked ? "red" : "#aaa",
                        }}
                      >
                        {isLiked ? "♥" : "♡"}
                      </button> */}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* PODCASTS */}
          {results.podcasts?.length > 0 && (
            <section style={sectionStyle}>
              <h3>Podcasts</h3>
              <div style={scrollContainerStyle}>
                {results.podcasts.map((p) => {
                  const isLiked = likedPodcasts.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      style={cardStyle}
                      onClick={() =>
                        updateNowPlaying?.({ ...p, type: "podcast" })
                      }
                    >
                      <div style={{ fontWeight: "bold" }}>{p.title}</div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        {p.host || "Unknown Host"}
                      </div>
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation(); // ✅ prevent triggering playback
                          toggleLike("podcast", p.id, isLiked);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "transparent",
                          border: "none",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                          color: isLiked ? "red" : "#aaa",
                        }}
                      >
                        {isLiked ? "♥" : "♡"}
                      </button> */}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* AUDIOBOOKS */}
          {results.audiobooks?.length > 0 && (
            <section style={sectionStyle}>
              <h3>Audiobooks</h3>
              <div style={scrollContainerStyle}>
                {results.audiobooks.map((a) => {
                  const isLiked = likedAudiobooks.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      style={cardStyle}
                      onClick={() =>
                        updateNowPlaying?.({ ...a, type: "audiobook" })
                      }
                    >
                      <div style={{ fontWeight: "bold" }}>{a.title}</div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        {a.author}
                      </div>
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation(); // ✅ prevent triggering playback
                          toggleLike("audiobook", a.id, isLiked);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "transparent",
                          border: "none",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                          color: isLiked ? "red" : "#aaa",
                        }}
                      >
                        {isLiked ? "♥" : "♡"}
                      </button> */}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Other sections like albums, playlists, genres remain unchanged */}
          {/* PLAYLISTS */}
          {results.playlists?.length > 0 && (
            <section style={sectionStyle}>
              <h3>Playlists</h3>
              <div style={scrollContainerStyle}>
                {results.playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    style={cardStyle}
                    onClick={() => navigate(`/playlists/search/${playlist.id}`)}
                  >
                    <div style={{ fontWeight: "bold" }}>{playlist.title}</div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {playlist.creator || "Unknown Creator"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <p style={{ marginTop: "1rem" }}>No results found.</p>
      )}
    </div>
  );
};

export default Search;
