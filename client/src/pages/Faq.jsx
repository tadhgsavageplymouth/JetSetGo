import React from "react";
import Accordion from "../components/Accordion";
import styles from "./Faq.module.css";

const FAQ_DATA = [
  {
    question: "What is JetSetGo?",
    answer: "JetSetGo is your all-in-one flight booking platform offering seamless private jet charters."
  },
  {
    question: "How do I book a flight?",
    answer: "To book, choose your route and dates, then submit the form—our team handles the rest."
  },
  // add more Q&A entries here
];

export default function Faq() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>
      <div className={styles.list}>
        {FAQ_DATA.map((item, idx) => (
          <Accordion key={idx} title={item.question}>
            <p>{item.answer}</p>
          </Accordion>
        ))}
      </div>
    </div>
  );
}