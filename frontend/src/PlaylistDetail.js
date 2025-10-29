// src/pages/PlaylistDetail.js
import React, { useEffect, useState } from "react";
import { FaEllipsisH, FaHeart, FaPlay } from "react-icons/fa";
import { useParams } from "react-router-dom";

export default function PlaylistDetail({ updateNowPlaying }) {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [likedSongs, setLikedSongs] = useState({});

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`/api/playlists/${playlistId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load playlist");

        setPlaylist({
          ...data,
          coverArt: `https://picsum.photos/seed/playlist${data.id}/300`,
          songs: data.songs.map((s) => ({
            ...s,
            plays: Math.floor(Math.random() * 10).toLocaleString(),
          })),
        });
      } catch (err) {
        console.error("Error loading playlist", err);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  if (!playlist) return <div className="p-6">Loading playlist...</div>;

  return (
    <div className="album-page p-6 bg-gradient-to-b from-purple-400 to-black text-white min-h-screen">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={playlist.coverArt}
          alt={playlist.title}
          className="w-48 h-48 object-cover rounded shadow-lg"
        />
        <div>
          <p className="uppercase text-sm">Playlist</p>
          <h1 className="text-5xl font-bold">{playlist.title}</h1>
          <p className="mt-2 text-lg text-white/80">
            {playlist.creator || "Unknown Creator"} • {playlist.songs.length}{" "}
            songs
          </p>
        </div>
      </div>

      {/* Controls */}
      {/* <div className="flex items-center gap-6 mb-6">
        <button
          className="text-green-500 hover:text-green-400 text-4xl"
          onClick={() => {
            if (playlist.songs.length > 0) {
              updateNowPlaying(playlist.songs[0]);
            }
          }}
        >
          <FaPlay />
        </button>

        <button className="text-pink-500 hover:text-pink-400 text-3xl">
          <FaHeart />
        </button>
        <button className="text-gray-300 hover:text-white text-2xl">
          <FaEllipsisH />
        </button>
      </div> */}

      {/* Tracklist */}
      <table className="w-full text-left mt-6 text-white/90">
        <thead>
          <tr /*className="border-b border-white/30 text-sm uppercase tracking-widest"*/
          >
            <th className="py-2">#</th>
            <th className="py-2">Title</th>
            <th className="py-2">Plays</th>
            <th className="py-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {playlist.songs.map((song, index) => (
            <tr
              key={song.id}
              onClick={() => updateNowPlaying(song)}
              className="hover:bg-white/10 cursor-pointer text-sm group"
            >
              <td className="py-3 px-1">{index + 1}</td>
              <td className="py-3">
                <div className="font-medium">{song.title}</div>
                {/* <div className="text-xs text-white/60">{song.artist || "Unknown"}</div> */}
              </td>
              <td className="py-3">{song.plays}</td>
              <td className="py-3">{song.duration}</td>
              <td className="py-3 pr-3">
                <button
                  className={`transition text-lg ${
                    likedSongs[song.id]
                      ? "text-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaPlay />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
