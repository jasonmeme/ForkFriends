import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Match() {
  const [name, setName] = useState("");
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatch = async (e) => {
    e && e.preventDefault();
    setError("");
    setMatch(null);
    if (!name.trim()) {
      setError("Please enter your name to check your match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/get-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not fetch match");
      setMatch(data.match);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 p-4`}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-6 border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-700 mb-2 text-center">Check Your Match</h1>
        <form onSubmit={fetchMatch} className="w-full flex flex-col gap-4">
          <input
            type="text"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            maxLength={50}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Match"}
          </button>
        </form>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {match !== null && (
          <div className="mt-4 w-full text-center">
            {match ? (
              <div className="text-green-700 text-xl font-semibold">You're matched with {match}!</div>
            ) : (
              <div className="text-gray-600 text-lg">No match yet. Please check back after 11 AM.</div>
            )}
          </div>
        )}
        <button
          onClick={fetchMatch}
          className="mt-2 text-blue-600 hover:underline text-sm"
          disabled={loading || !name.trim()}
        >
          Refresh
        </button>
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Northeast Delta Dental
      </footer>
    </div>
  );
} 