// client/src/components/FlightSearch.jsx

import React, { useState } from "react";
import styles from "./FlightSearch.module.css";

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);
const holidayTypes = [
  "City Break",
  "Cultural",
  "Luxury",
  "Religious",
  "Adventure",
  "Beach",
  "Party",
];
const climates = ["hot", "mild", "cold"];

export default function FlightSearch() {
  const [form, setForm] = useState({
    origin_city: "",
    month: "",
    year: new Date().getFullYear(),
    holiday_type: "",
    max_price: "",
    climate: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [apiError, setApiError] = useState("");

  // A pure check, no setState inside here
  const isFormValid =
    form.origin_city.trim() !== "" &&
    form.month !== "" &&
    form.year >= 2023 &&
    form.holiday_type !== "" &&
    parseFloat(form.max_price) > 0 &&
    form.climate !== "";

  // Only run this on submit
  const validate = () => {
    const errs = {};
    if (!form.origin_city.trim()) errs.origin_city = "Required";
    if (!form.month) errs.month = "Required";
    if (!form.year || form.year < 2023) errs.year = "Enter 2023 or later";
    if (!form.holiday_type) errs.holiday_type = "Required";
    if (!form.max_price || parseFloat(form.max_price) <= 0)
      errs.max_price = "Must be > 0";
    if (!form.climate) errs.climate = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // run validation *once* here
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    setResults([]);

    try {
      const res = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year, 10),
          max_price: parseFloat(form.max_price),
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "API error");
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Origin */}
        <div className={styles.field}>
          <label>Origin City</label>
          <input
            name="origin_city"
            value={form.origin_city}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.origin_city && (
            <span className={styles.error}>{errors.origin_city}</span>
          )}
        </div>

        {/* Month */}
        <div className={styles.field}>
          <label>Month</label>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">– Select month –</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {errors.month && <span className={styles.error}>{errors.month}</span>}
        </div>

        {/* Year */}
        <div className={styles.field}>
          <label>Year</label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.year && <span className={styles.error}>{errors.year}</span>}
        </div>

        {/* Holiday Type */}
        <div className={styles.field}>
          <label>Holiday Type</label>
          <select
            name="holiday_type"
            value={form.holiday_type}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">– Select type –</option>
            {holidayTypes.map((ht) => (
              <option key={ht} value={ht}>
                {ht}
              </option>
            ))}
          </select>
          {errors.holiday_type && (
            <span className={styles.error}>{errors.holiday_type}</span>
          )}
        </div>

        {/* Max Price */}
        <div className={styles.field}>
          <label>Max Price (GBP)</label>
          <input
            type="number"
            step="0.01"
            name="max_price"
            value={form.max_price}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.max_price && (
            <span className={styles.error}>{errors.max_price}</span>
          )}
        </div>

        {/* Climate */}
        <div className={styles.field}>
          <label>Climate</label>
          <select
            name="climate"
            value={form.climate}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">– Select climate –</option>
            {climates.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          {errors.climate && (
            <span className={styles.error}>{errors.climate}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={styles.button}
        >
          {loading ? "Searching…" : "Search Flights"}
        </button>
      </form>

      {apiError && <div className={styles.apiError}>{apiError}</div>}

      {results.length > 0 && (
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Airline</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Price (GBP)</th>
              <th>Departure</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.airline}</td>
                <td>{r.origin_city}</td>
                <td>{r.destination_city}</td>
                <td>£{r.price_gbp.toFixed(2)}</td>
                <td>
                  {new Date(r.departure_datetime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
