import React, { useState } from 'react';

function CreateUser() {
  const [formData, setFormData] = useState({
    email_id: '',
    pass: '',
    first_name: '',
    last_name: '',
    telephone_number: '',
    account_creation_date: ''  // Expecting YYYY-MM-DD format
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('User created successfully!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  return (
    <div>
      <h2>Create New User</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" name="pass" value={formData.pass} onChange={handleChange} required />
        </div>
        <div>
          <label>First Name: </label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Last Name: </label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Telephone Number: </label>
          <input type="text" name="telephone_number" value={formData.telephone_number} onChange={handleChange} />
        </div>
        <div>
          <label>Account Creation Date: </label>
          <input type="date" name="account_creation_date" value={formData.account_creation_date} onChange={handleChange} required />
        </div>
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}

export default CreateUser;
