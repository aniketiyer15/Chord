import React, { useEffect, useState } from "react";
import "./ArtistDashboard.css";

const ArtistDashboard = ({ loggedInUser }) => {
  const [audioforms, setAudioforms] = useState([]);
  const [formType, setFormType] = useState("");
  const [formData, setFormData] = useState({});
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const artist_id = loggedInUser?.user_id;

  useEffect(() => {
    if (!artist_id) return;
    loadAudioforms();
    loadAlbums();
    loadGenres();
  }, [artist_id]);

  const resetForm = () => {
    setFormData({});
    setFormType("");
    setEditingId(null);
    loadAudioforms();
  };

  const loadAudioforms = async () => {
    const res = await fetch(`/api/artist/audioforms?artist_id=${artist_id}`);
    const data = await res.json();
    setAudioforms(data);
  };

  const loadAlbums = async () => {
    const res = await fetch(`/api/artist/albums?artist_id=${artist_id}`);
    const data = await res.json();
    setAlbums(data);
  };

  const loadGenres = async () => {
    const res = await fetch("/api/genres");
    const data = await res.json();
    setGenres(data);
  };

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let endpoint = "";
    const method = editingId ? "PUT" : "POST";
    const payload = { ...formData, artist_id };

    if (formType === "song")
      endpoint = editingId ? `/api/songs/${editingId}` : "/api/create-song";
    else if (formType === "album")
      endpoint = editingId ? `/api/albums/${editingId}` : "/api/create-album";
    else if (formType === "podcast")
      endpoint = editingId
        ? `/api/podcasts/${editingId}`
        : "/api/create-podcast";
    else if (formType === "audiobook")
      endpoint = editingId
        ? `/api/audiobooks/${editingId}`
        : "/api/create-audiobook";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setSuccess(data.message || "Saved!");
      resetForm();
    } else {
      setError(data.error || "Error saving");
    }
  };

  const handleEdit = (type, item) => {
    setFormType(type);
    setEditingId(item.id);

    const formatted = { ...item };
    if (type === "album" && item.release_date) {
      formatted.release_date = new Date(item.release_date)
        .toISOString()
        .split("T")[0];
    }
    setFormData(formatted);
  };

  const handleDelete = async (type, id) => {
    let endpoint = "";
    if (type === "Song") endpoint = `/api/songs/${id}`;
    else if (type === "Album") endpoint = `/api/albums/${id}`;
    else if (type === "Podcast") endpoint = `/api/podcasts/${id}`;
    else if (type === "Audiobook") endpoint = `/api/audiobooks/${id}`;

    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Deleted successfully");
      loadAudioforms();
    } else {
      setError("Delete failed");
    }
  };

  return (
    <div className="artist-dashboard">
      <h2>🎵 Welcome, {loggedInUser.user_name}!</h2>

      <div className="button-group">
        <button onClick={() => setFormType("album")}>+ Album</button>
        <button onClick={() => setFormType("song")}>+ Song</button>
        <button onClick={() => setFormType("podcast")}>+ Podcast</button>
        <button onClick={() => setFormType("audiobook")}>+ Audiobook</button>
      </div>

      {formType && (
        <form onSubmit={handleSubmit} className="audioform-form">
          <h3>{editingId ? `Edit ${formType}` : `Create ${formType}`}</h3>
          {success && <p className="success-msg">{success}</p>}
          {error && <p className="error-msg">{error}</p>}

          {formType === "album" && (
            <>
              <input
                className="input-field"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Album Title"
                required
              />
              <input
                className="input-field"
                name="release_date"
                type="date"
                value={formData.release_date || ""}
                onChange={handleChange}
                required
              />
            </>
          )}

          {formType === "song" && (
            <>
              <input
                className="input-field"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Song Title"
                required
              />
              <input
                className="input-field"
                name="duration"
                value={formData.duration || ""}
                onChange={handleChange}
                placeholder="Duration"
                required
              />
              <input
                className="input-field"
                name="loudness"
                value={formData.loudness || ""}
                onChange={handleChange}
                placeholder="Loudness"
                required
              />
              <select
                className="input-field"
                name="genre_id"
                value={formData.genre_id || ""}
                onChange={handleChange}
                required
              >
                <option value="">Genre</option>
                {genres.map((g) => (
                  <option key={g.genre_id} value={g.genre_id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <select
                className="input-field"
                name="album_id"
                value={formData.album_id || ""}
                onChange={handleChange}
              >
                <option value="">Optional: Album</option>
                {albums.map((a) => (
                  <option key={a.album_id} value={a.album_id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </>
          )}

          {formType === "podcast" && (
            <>
              <input
                className="input-field"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Podcast Title"
                required
              />
              <input
                className="input-field"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Description"
                required
              />
              <input
                className="input-field"
                name="language"
                value={formData.language || ""}
                onChange={handleChange}
                placeholder="Language"
                required
              />
              <input
                className="input-field"
                name="publisher"
                value={formData.publisher || ""}
                onChange={handleChange}
                placeholder="Publisher"
                required
              />
              <input
                className="input-field"
                name="total_episodes"
                value={formData.total_episodes || ""}
                onChange={handleChange}
                placeholder="Total Episodes"
                required
              />
            </>
          )}

          {formType === "audiobook" && (
            <>
              <input
                className="input-field"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Audiobook Title"
                required
              />
              <input
                className="input-field"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Description"
                required
              />
              <input
                className="input-field"
                name="author"
                value={formData.author || ""}
                onChange={handleChange}
                placeholder="Author"
                required
              />
              <input
                className="input-field"
                name="publisher"
                value={formData.publisher || ""}
                onChange={handleChange}
                placeholder="Publisher"
                required
              />
              <input
                className="input-field"
                name="total_chapters"
                value={formData.total_chapters || ""}
                onChange={handleChange}
                placeholder="Chapters"
                required
              />
            </>
          )}

          <button type="submit" className="btn-primary">
            Save
          </button>
          <button type="button" className="btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        </form>
      )}

      <h3>Your Audioforms</h3>
      <ul className="audioform-list">
        {audioforms.map((a, i) => (
          <li key={i} className="audioform-item">
            <div>
              <b>{a.title}</b> ({a.type})
            </div>
            <div className="item-buttons">
              <button onClick={() => handleEdit(a.type.toLowerCase(), a)}>
                Edit
              </button>
              <button onClick={() => handleDelete(a.type, a.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistDashboard;
