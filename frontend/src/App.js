import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import PlaylistList from "./PlaylistList";
import PlaylistView from "./PlaylistView";
import Signup from "./Signup";
import Login from "./Login";
import ArtistDashboard from "./ArtistDashboard";
import Home from "./Home";
import Player from "./Player";
import Search from "./Search";
import Settings from "./Settings";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AlbumDetail from "./AlbumDetail";
import PlaylistDetail from "./PlaylistDetail";
import AdminDashboard from "./AdminDashboard";

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [nowPlaying, setNowPlaying] = useState({ title: "", artist: "" });
  const [darkMode, setDarkMode] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  const loadPlaylists = () => {
    if (loggedInUser?.role === "user") {
      fetch(`/api/playlists?user_id=${loggedInUser.user_id}`)
        .then((res) => res.json())
        .then(setUserPlaylists)
        .catch(() => setUserPlaylists([]));
    }
  };
  const handlePlaylistCreated = () => {
    if (loggedInUser?.role === "user") {
      fetch(`/api/playlists?user_id=${loggedInUser.user_id}`)
        .then((res) => res.json())
        .then(setUserPlaylists)
        .catch(() => setUserPlaylists([]));
    }
  };
  useEffect(() => {
    loadPlaylists();
  }, [loggedInUser]);

  const handleLogout = () => {
    setLoggedInUser(null);
    setNowPlaying({ title: "", artist: "" });
    setUserPlaylists([]);
  };

  return (
    <BrowserRouter>
      <div
        className={
          darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"
        }
      >
        {loggedInUser && (
          <Navbar
            toggleTheme={toggleTheme}
            darkMode={darkMode}
            onLogout={handleLogout}
          />
        )}

        <div style={{ display: "flex" }}>
          {loggedInUser?.role === "user" && (
            <Sidebar playlists={userPlaylists} />
          )}

          <main
            style={{
              marginLeft: loggedInUser?.role === "user" ? "200px" : "0",
              flex: 1,
            }}
          >
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  loggedInUser ? (
                    loggedInUser.role === "artist" ? (
                      <Navigate to="/artist-dashboard" replace />
                    ) : loggedInUser.role === "admin" ? (
                      <Navigate to="/admin-dashboard" replace />
                    ) : (
                      <Home
                        updateNowPlaying={setNowPlaying}
                        loggedInUser={loggedInUser}
                      />
                    )
                  ) : (
                    <Login onLogin={setLoggedInUser} />
                  )
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  loggedInUser?.role === "admin" ? (
                    <AdminDashboard loggedInUser={loggedInUser} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              <Route
                path="/playlists"
                element={
                  loggedInUser ? (
                    <PlaylistList
                      user={loggedInUser}
                      onPlaylistCreated={handlePlaylistCreated}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/playlists/:id"
                element={
                  loggedInUser ? (
                    <PlaylistView
                      loggedInUser={loggedInUser}
                      onPlaylistUpdate={handlePlaylistCreated}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/artist-dashboard"
                element={
                  loggedInUser?.role === "artist" ? (
                    <ArtistDashboard loggedInUser={loggedInUser} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/search"
                element={
                  <Search
                    updateNowPlaying={setNowPlaying}
                    loggedInUser={loggedInUser}
                  />
                }
              />

              <Route
                path="/settings"
                element={<Settings loggedInUser={loggedInUser} />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route
                path="/album/:albumId"
                element={<AlbumDetail updateNowPlaying={setNowPlaying} />}
              />
              <Route
                path="/albums/:albumId"
                element={<AlbumDetail updateNowPlaying={setNowPlaying} />}
              />
              <Route
                path="/playlists/search/:playlistId"
                element={<PlaylistDetail updateNowPlaying={setNowPlaying} />}
              />
            </Routes>
          </main>
        </div>

        {loggedInUser && (
          <div className="player-container">
            <Player nowPlaying={nowPlaying} loggedInUser={loggedInUser} />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}
