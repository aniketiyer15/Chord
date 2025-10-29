import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function Settings({ loggedInUser }) {
  const [profile, setProfile] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState("");

  function fetchUserProfile(userId) {
    return fetch(`/api/profile?user_id=${userId}`).then((res) => res.json());
  }

  useEffect(() => {
    if (!loggedInUser) return;
    fetchUserProfile(loggedInUser.user_id).then((data) => {
      setProfile(data);
      setPhone(data.telephone_number || "");
    });
  }, [loggedInUser]);

  const handlePhoneUpdate = async () => {
    try {
      const res = await fetch("/api/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          telephone_number: phone,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setEditingPhone(false);
    } catch (err) {
      console.error("Error updating phone number", err);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-600 dark:text-gray-400">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-6 p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FaUserCircle
              size={64}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profile.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Joined{" "}
              {new Date(profile.joinedDate).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around p-8 bg-gray-100 dark:bg-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Playlists
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.playlistsCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Followers
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.followers}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Following
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.following}
            </p>
          </div>
        </div>

        {/* Editable Phone Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Phone Number
          </h3>
          {editingPhone ? (
            <div className="flex gap-2 items-center">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-1 border rounded-md text-black"
                placeholder="Enter phone number"
              />
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-md"
                onClick={handlePhoneUpdate}
              >
                Save
              </button>
              <button
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-md"
                onClick={() => {
                  setPhone(profile.phone || "");
                  setEditingPhone(false);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                {phone || "No phone number added"}
              </span>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setEditingPhone(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
