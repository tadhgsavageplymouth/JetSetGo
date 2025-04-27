import React from "react";
import Accordion from "../components/Accordion";
import styles from "./Faq.module.css";

const FAQ_DATA = [
  { question: "What can I do on JetSetGo?", answer: "Search and book private jet flights tailored to your schedule and preferences." },
  { question: "How do I customize my journey?", answer: "Use filters like departure date, budget, and climate to find the perfect trip." },
  { question: "Is my data secure?", answer: "We use industry-standard encryption to keep your information safe." },
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