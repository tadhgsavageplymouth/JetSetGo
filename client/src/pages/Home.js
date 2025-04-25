import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch {
      console.error("Failed to log out");
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome, {currentUser.email}</h2>
      <button className={styles.button} onClick={handleLogout}>Log Out</button>
      <div className={styles.links}>
        <Link className={styles.link} to="/settings">Settings</Link>
        <Link className={styles.link} to="/faq">FAQ</Link>
      </div>
    </div>
  );
}