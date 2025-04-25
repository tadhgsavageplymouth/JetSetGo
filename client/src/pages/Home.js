import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

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
    <div>
      <h2>Welcome, {currentUser.email}</h2>
      <button onClick={handleLogout}>Log Out</button>
      <p>
        Go to <Link to="/settings">Settings</Link>
      </p>
      <p>
        Read our <Link to="/faq">FAQ</Link>
      </p>
    </div>
  );
}