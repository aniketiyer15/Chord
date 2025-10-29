// src/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    email_id: "",
    pass: "",
    first_name: "",
    last_name: "",
    telephone_number: "",
    account_creation_date: new Date().toISOString().split("T")[0],
    role: "user", // default role
    type: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("User created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage("Something went wrong. Please try a different email ID");
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>Create New Account</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email_id"
              value={formData.email_id}
              onChange={handleChange}
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Enter a valid email address (e.g., user@example.com)"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="pass"
              value={formData.pass}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Telephone Number:</label>
            <input
              type="tel"
              name="telephone_number"
              inputMode="numeric"
              pattern="^[0-9]{10}$"
              maxLength={10}
              value={formData.telephone_number}
              onChange={(e) => {
                // strip non-digits as you type
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setFormData((f) => ({ ...f, telephone_number: onlyDigits }));
              }}
              required
              title="Enter a valid 10-digit phone number (digits only)"
            />
          </div>
          <div className="form-group">
            <label>Sign up as:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="artist">Artist</option>
            </select>
          </div>
          {formData.role === "artist" && (
            <>
              <div className="form-group">
                <label>Type of Artist:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="singer">Singer</option>
                  <option value="narrator">Narrator</option>
                  <option value="host">Host</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about yourself"
                />
              </div>
            </>
          )}
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}
