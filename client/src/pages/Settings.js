// client/src/pages/Settings.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Settings.module.css";

export default function Settings() {
  const { currentUser, changeEmail, changePassword } = useAuth();
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleEmailChange(e) {
    e.preventDefault();
    try {
      setError("");
      await changeEmail(email);
      setMessage("Email updated successfully!");
    } catch {
      setError("Failed to update email");
      setMessage("");
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    try {
      setError("");
      await changePassword(password);
      setMessage("Password updated successfully!");
    } catch {
      setError("Failed to update password");
      setMessage("");
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.message}>{message}</div>}

      <form onSubmit={handleEmailChange} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            New Email
          </label>
          <input
            id="email"
            className={styles.formInput}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">
          Update Email
        </button>
      </form>

      <form onSubmit={handlePasswordChange} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            New Password
          </label>
          <input
            id="password"
            className={styles.formInput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">
          Update Password
        </button>
      </form>
    </div>
  );
}
