import React, { useRef, useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

const Player = ({ nowPlaying, loggedInUser }) => {
  console.log(nowPlaying);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);

  const audioSrc =
    nowPlaying.audioUrl ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  useEffect(() => {
    if (audioRef.current) {
      playing ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [playing, nowPlaying]);

  useEffect(() => {
    setLiked(false); // reset like status when media changes
  }, [nowPlaying]);

  const togglePlay = () => setPlaying((prev) => !prev);

  const updateProgress = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100 || 0);
    }
  };

  const seek = (e) => {
    const seekTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  const handleLike = async () => {
    if (!loggedInUser || !nowPlaying /*|| !nowPlaying.type*/) return;

    const type = nowPlaying.type; // e.g. 'song', 'podcast', 'audiobook'
    alert(type);
    console.log(type);
    const endpoints = {
      song: "/api/like-song",
      podcast: "/api/like-podcast",
      audiobook: "/api/like-audiobook",
    };

    const endpoint = endpoints[type];
    const idField = `${type}_id`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          [idField]: nowPlaying.id,
        }),
      });

      if (res.ok) {
        setLiked(true);
      } else {
        console.error(`Failed to like ${type}`);
      }
    } catch (err) {
      console.error(`Error liking ${type}:`, err);
    }
  };

  return (
    <div className="player-bar">
      <div className="now-playing">
        <strong>{nowPlaying.title}</strong>
        {nowPlaying.artist && ` — ${nowPlaying.artist}`}
      </div>
      <div className="player-controls">
        <button onClick={togglePlay}>{playing ? "❚❚" : "►"}</button>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={seek}
          className="progress-slider"
        />
        <button
          onClick={handleLike}
          title="Like this"
          className={`ml-4 transition ${
            liked ? "text-pink-500" : "text-gray-400 hover:text-white"
          }`}
        >
          <FaHeart />
        </button>
      </div>
      <audio ref={audioRef} src={audioSrc} onTimeUpdate={updateProgress} />
    </div>
  );
};

export default Player;
