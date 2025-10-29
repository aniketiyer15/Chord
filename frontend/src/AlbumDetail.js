import React, { useEffect, useState } from 'react';
import { FaEllipsisH, FaHeart, FaPlay } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
//import { likeSong } from '../api';

export default function AlbumDetail({ updateNowPlaying }) {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [likedSongs, setLikedSongs] = useState({});

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`/api/albums/${albumId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load album");
        
        setAlbum({
          ...data,
          coverArt: `https://picsum.photos/seed/${data.id}/300`,
          songs: data.songs.map(s => ({
            ...s,
            plays: Math.floor(Math.random() * 1000000).toLocaleString(), // fake plays
          }))
        });
      } catch (err) {
        console.error("Error loading album", err);
      }
    };
    fetchAlbum();
  }, [albumId]);
  

//   const handleLike = async (e, songId) => {
//     e.stopPropagation();
//     await likeSong(songId);
//     setLikedSongs(prev => ({ ...prev, [songId]: true }));
//   }; 

  if (!album) return <div className="p-6">Loading album...</div>;

  return (
    <div className="album-page p-6 bg-gradient-to-b from-pink-300 to-black text-white min-h-screen">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={album.coverArt}
          alt={album.title}
          className="w-48 h-48 object-cover rounded shadow-lg"
        />
        <div>
          <p className="uppercase text-sm">Album</p>
          <h1 className="text-5xl font-bold">{album.title}</h1>
          <p className="mt-2 text-lg text-white/80">
            {album.artist} • {album.year} • {album.songs.length} songs
            {/* , {album.duration} */}
          </p>
        </div>
      </div>

      {/* Controls */}
      {/* <div className="flex items-center gap-6 mb-6">
        <button
          className="text-green-500 hover:text-green-400 text-4xl"
          onClick={() => {
            if (album.songs.length > 0) {
              updateNowPlaying(album.songs[0]);
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
          <tr className="border-b border-white/30 text-sm uppercase tracking-widest">
            <th className="py-2">#</th>
            <th className="py-2">Title</th>
            <th className="py-2">Plays</th>
            <th className="py-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {album.songs.map((song, index) => (
            <tr
              key={song.id}
              onClick={() => updateNowPlaying(song)}
              className="hover:bg-white/10 cursor-pointer text-sm group"
            >
              <td className="py-3 px-1">{index + 1}</td>
              <td className="py-3">
                <div className="font-medium">{song.title}</div>
                <div className="text-xs text-white/60">{song.artist}</div>
              </td>
              <td className="py-3">{song.plays}</td>
              <td className="py-3">{song.duration}</td>
              <td className="py-3 pr-3">
                <button
                  //onClick={e => handleLike(e, song.id)}
                  className={`transition text-lg ${
                    likedSongs[song.id]
                      ? 'text-pink-500'
                      : 'text-gray-400 hover:text-white'
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

 