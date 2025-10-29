import React from 'react';

export default function MusicCard({ track, updateNowPlaying }) {
  const handleClick = () => {
    if (updateNowPlaying) updateNowPlaying(track);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: updateNowPlaying ? 'pointer' : 'default',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow .2s',
        background: '#fff',
        border: '1px solid #ddd',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <img
        src={track.artwork}
        alt={track.title}
        style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ padding: '0.5rem', textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{track.title}</div>
        {track.artist && (
          <div style={{ color: '#666', fontSize: '0.85rem' }}>{track.artist}</div>
        )}
      </div>
    </div>
  );
}
 