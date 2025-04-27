// File: src/pages/Mission.jsx
import React from "react";
import styles from "./Mission.module.css";
import heroImg from "../assets/plane_world.jpg";

export default function Mission() {
  return (
    <section className={styles.mission}>
      <img
        src={heroImg}
        alt="Private jet in flight"
        className={styles.heroImage}
      />
      <div className={styles.textContainer}>
        <h2>Who We Are</h2>
        <p>
          At JetSetGo, we believe in delivering the highest quality private jet
          charter experience. From tailored flight plans to personalized
          in-flight services, our mission is to bring luxury, flexibility, and
          peace of mind to your travel.
        </p>
      </div>
    </section>
  );
}
