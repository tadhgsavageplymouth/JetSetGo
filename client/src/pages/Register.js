import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Auth.module.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      await register(email, password);
      navigate("/");
    } catch {
      setError("Failed to create an account");
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Register</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email</label>
          <input
            className={styles.formInput}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Password</label>
          <input
            className={styles.formInput}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Sign Up</button>
      </form>
      <div className={styles.linkGroup}>
        Already have an account? <Link className={styles.link} to="/login">Log In</Link>
      </div>
      <div className={styles.linkGroup}>
        <Link className={styles.link} to="/faq">Read FAQ</Link>
      </div>
    </div>
  );
}