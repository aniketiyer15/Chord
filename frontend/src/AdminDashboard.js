import React, { useState } from "react";
import { FaTimes, FaTimesCircle } from "react-icons/fa";
import { BarChart } from "@mui/x-charts/BarChart";
import Signup from "./Signup";
import "./AdminDashboard.css";  // new!

// const dummyFetch = (type) =>
//   new Promise((resolve) =>
//     setTimeout(() => resolve([`${type} 1`, `${type} 2`, `${type} 3`]), 500)
//   );

const Modal = ({
  title,
  content,
  onClose,
  onDeleteUser,
  onDeleteSong,
  onDeleteAlbum,
}) => {
  const lower = title.toLowerCase();
  const isUserModal  = lower.includes("user");
  const isSongModal  = lower.includes("song");
  const isAlbumModal = lower.includes("album");

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <div className="modal-header">
          <h2>{title}</h2>
          <FaTimes onClick={onClose} className="icon-close" />
        </div>
        <div className="modal-body">
          {Array.isArray(content) ? (
            content.map((item) => {
              const key = isUserModal
                ? item.user_id
                : isSongModal
                ? item.song_id
                : isAlbumModal
                ? item.album_id
                : item.id;
              return (
                <div key={key} className="list-item">
                  <div>
                    <p className="item-title">
                      {isUserModal
                        ? `${item.first_name} ${item.last_name}`
                        : item.title}
                    </p>
                    {isUserModal && (
                      <p className="item-subtitle">{item.email_id}</p>
                    )}
                  </div>
                  {(isUserModal || isSongModal || isAlbumModal) && (
                    <FaTimesCircle
                      onClick={() => {
                        if (isUserModal)  onDeleteUser(item.user_id);
                        if (isSongModal)  onDeleteSong(item.song_id);
                        if (isAlbumModal) onDeleteAlbum(item.album_id);
                      }}
                      className="icon-delete"
                    />
                  )}
                </div>
              );
            })
          ) : (
            <p className="error-text">Invalid content format</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    email_id: "",
    pass: "",
    first_name: "",
    last_name: "",
    telephone_number: "",
    account_creation_date: new Date().toDateString(),
  });
  const [message, setMessage] = useState("");
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [statsData, setStatsData] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDeleteUser = async (userId) => {
    await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const res = await fetch("/api/admin/users");
    setModalContent(await res.json());
  };

  const handleDeleteSong = async (songId) => {
    await fetch("/api/admin/delete-song", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song_id: songId }),
    });
    const res = await fetch("/api/admin/songs");
    setModalContent(await res.json());
  };

  const handleDeleteAlbum = async (albumId) => {
    await fetch(`/api/albums/${albumId}`, { method: "DELETE" });
    const res = await fetch("/api/admin/albums");
    setModalContent(await res.json());
  };

  const openModal = async (title, type) => {
    setShowStatistics(false);
    setShowUsers(false);
    setModalTitle(title);

    let data;
    if (type === "User") {
      data = await (await fetch("/api/admin/users")).json();
    } else if (type === "Song") {
      data = await (await fetch("/api/admin/songs")).json();
    } else if (type === "Album") {
      data = await (await fetch("/api/admin/albums")).json();
    } else {
    //   data = await dummyFetch(type);
    }
    setModalContent(data);
    setShowModal(true);
  };

  const statisticsModal = async () => {
    setShowModal(false);
    setShowUsers(false);
    const data = await (await fetch("/api/admin/statistics")).json();
    setStatsData(data);
    setShowStatistics(true);
  };

  const showUsersModal = () => {
    setShowModal(false);
    setShowStatistics(false);
    setShowUsers(true);
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="button-group">
        <button onClick={statisticsModal} className="btn btn-primary">
          View Statistics
        </button>
        <button onClick={showUsersModal} className="btn btn-secondary">
          Add Users
        </button>
        <button onClick={() => openModal("Remove Users", "User")} className="btn btn-danger">
          Remove Users
        </button>
        <button onClick={() => openModal("View All Songs", "Song")}  className="btn btn-warning">
          View All Songs
        </button>
        <button onClick={() => openModal("View All Albums", "Album")} className="btn btn-info">
          View All Albums
        </button>
      </div>

      {showModal && (
        <Modal
          title={modalTitle}
          content={modalContent}
          onClose={() => setShowModal(false)}
          onDeleteUser={handleDeleteUser}
          onDeleteSong={handleDeleteSong}
          onDeleteAlbum={handleDeleteAlbum}
        />
      )}

      {showStatistics && statsData && (
        <div className="chart-container">
          <FaTimesCircle onClick={() => setShowStatistics(false)} className="icon-close-chart" />
          <BarChart
            xAxis={[{ scaleType: "band", data: Object.keys(statsData) }]}
            series={[{ data: Object.values(statsData) }]}
            height={300}
            width={600}
          />
        </div>
      )}

      {showUsers && (
        <div className="user-form-card">
          <FaTimes onClick={() => setShowUsers(false)} className="icon-close-form" />
          <Signup
            formData={formData}
            handleChange={handleChange}
            setMessage={setMessage}
          />
          {message && <p className="success-text">{message}</p>}
        </div>
      )}
    </div>
  );
}
