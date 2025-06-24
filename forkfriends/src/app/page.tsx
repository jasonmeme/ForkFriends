"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [name, setName] = useState("");
  const [available, setAvailable] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [match, setMatch] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Poll for match after 11 AM if submitted
  useEffect(() => {
    if (!submitted || !name) return;
    const fetchMatch = async () => {
      setLoading(true);
      const res = await fetch(`/api/get-match?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      setMatch(data.match);
      setLoading(false);
    };
    fetchMatch();
    const now = new Date();
    if (now.getHours() >= 11) {
      const interval = setInterval(fetchMatch, 15000);
      return () => clearInterval(interval);
    }
  }, [submitted, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/mark-available", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, available_today: available }),
    });
    setSubmitted(true);
    setLoading(false);
  };

  const now = new Date();
  const after11 = now.getHours() >= 11;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>ForkFriends</h1>
        <p style={{ fontSize: 18, color: "#666", marginBottom: 24 }}>Delta Dental Lunch Pairing</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 280 }}>
          <label style={{ fontWeight: 500, marginBottom: 4 }} htmlFor="name">Enter your name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={submitted}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
            autoComplete="off"
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <input
              type="checkbox"
              checked={available}
              onChange={e => setAvailable(e.target.checked)}
              disabled={submitted}
              style={{ width: 18, height: 18 }}
            />
            I'm available for lunch today
          </label>
          <button
            type="submit"
            disabled={submitted || !name || !available || loading}
            style={{
              marginTop: 20,
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "12px 0",
              fontSize: 18,
              fontWeight: 600,
              cursor: submitted ? "not-allowed" : "pointer",
              opacity: submitted ? 0.7 : 1,
              transition: "opacity 0.2s"
            }}
          >
            {submitted ? "Submitted" : "Submit"}
          </button>
        </form>
        {submitted && (
          <div style={{ marginTop: 32, minHeight: 40, fontSize: 20, fontWeight: 500 }}>
            {loading && "Checking for your match..."}
            {!loading && after11 && match === null && "No match today"}
            {!loading && after11 && match && `You're matched with: ${match}`}
            {!loading && !after11 && "Matches will be available after 11 AM"}
          </div>
        )}
      </main>
      <footer className={styles.footer}>
        <span style={{ fontSize: 14, color: "#888" }}>© {new Date().getFullYear()} ForkFriends for Delta Dental</span>
      </footer>
    </div>
  );
}
