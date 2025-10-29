// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
 
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
 
  // const submitLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch('/api/login', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       // Sending the username as email_id for compatibility with backend
  //       body: JSON.stringify({ email_id: username, pass: password })
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       // Successful login, call onLogin with user data.
  //       onLogin(data.user);
  //     } else {
  //       alert(data.error);
  //     }
  //   } catch (error) {
  //     alert('Network error: ' + error.message);
  //   }
  // };

  const submitLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: username, pass: password })
      });
  
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        alert(`Welcome back, ${data.first_name || 'User'}!`);
        localStorage.setItem("loggedInUser", JSON.stringify(data));
  
        // Structure and pass only necessary data
        const userInfo = {
          user_id: data.id,
          user_name: data.name,
          role: data.role  // 'user' or 'artist' or 'admin'
        };
  
        onLogin(userInfo);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };  
  
 
  return (
    <div className="login-page">
      <form onSubmit={submitLogin} className="login-card">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};
 
export default Login;