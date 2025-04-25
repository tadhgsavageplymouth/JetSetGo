import { useState } from "react";

export default function Home() {
  const [inputs, setInputs] = useState({
    origin_city: "", month: "July", year: 2025,
    holiday_type: "Cultural", max_price: 500, climate: "hot"
  });
  const [results, setResults] = useState([]);

  const handleChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs)
    });
    if (!res.ok) {
      alert("Search error: " + (await res.text()));
      return;
    }
    setResults(await res.json());
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="origin_city" placeholder="Origin City"
          value={inputs.origin_city} onChange={handleChange}
          className="border p-2 w-full"
        />
        {/* month, year, holiday_type, max_price, climate inputs similarly */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Search Flights
        </button>
      </form>

      {results.length > 0 && (
        <table className="mt-6 w-full table-auto">
          <thead>
            <tr>
              {["Airline","Origin","Destination","Price","Departure"].map(h => (
                <th key={h} className="border px-2 py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r,i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{r.airline}</td>
                <td className="border px-2 py-1">{r.origin_city}</td>
                <td className="border px-2 py-1">{r.destination_city}</td>
                <td className="border px-2 py-1">£{r.price_gbp}</td>
                <td className="border px-2 py-1">
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
