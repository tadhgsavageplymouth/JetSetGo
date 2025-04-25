import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const { currentUser, changeEmail, changePassword } = useAuth();
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleEmailChange(e) {
    e.preventDefault();
    try {
      await changeEmail(email);
      setMessage("Email updated!");
    } catch {
      setMessage("Failed to update email");
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    try {
      await changePassword(password);
      setMessage("Password updated!");
    } catch {
      setMessage("Failed to update password");
    }
  }

  return (
    <div>
      <h2>Settings</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleEmailChange}>
        <label>New Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Update Email</button>
      </form>

      <form onSubmit={handlePasswordChange}>
        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}