import { useState, useEffect, useRef } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SIGNUP_KEY = "forkfriends_signup";
const NAME_KEY = "forkfriends_name";
const MATCH_KEY = "forkfriends_match";
const MATCH_FETCHED_KEY = "forkfriends_match_fetched";

function getTodayStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getNext11AM() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(11, 0, 0, 0);
  if (now > next) {
    // Already past 11am today
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export default function Home() {
  const [name, setName] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [match, setMatch] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [now, setNow] = useState(new Date());
  const [matchFetched, setMatchFetched] = useState(false);
  const intervalRef = useRef();

  // On mount, check localStorage for signup and name
  useEffect(() => {
    const storedDate = localStorage.getItem(SIGNUP_KEY);
    const storedName = localStorage.getItem(NAME_KEY);
    const fetchedToday = localStorage.getItem(MATCH_FETCHED_KEY) === getTodayStr();
    if (storedDate === getTodayStr() && storedName) {
      setSignedUp(true);
      setName(storedName);
      setMatchFetched(fetchedToday);
    }
    setNow(new Date());
  }, []);

  // Countdown timer
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      setNow(now);
      const eleven = new Date(now);
      eleven.setHours(11, 0, 0, 0);
      if (now < eleven) {
        const diff = eleven - now;
        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdown(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
      } else {
        setCountdown("");
      }
    }
    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // After 11am, if signed up, fetch match (only once)
  useEffect(() => {
    const eleven = new Date(now);
    eleven.setHours(11, 0, 0, 0);
    if (signedUp && now >= eleven && name && !matchFetched) {
      fetchMatch(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedUp, now, name, matchFetched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem(SIGNUP_KEY, getTodayStr());
      localStorage.setItem(NAME_KEY, name);
      setSignedUp(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function fetchMatch(name) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/get-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not fetch match");
      setMatch(data.match);
      setMatchFetched(true);
      localStorage.setItem(MATCH_FETCHED_KEY, getTodayStr());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Temporary test function for match.js
  async function testMatchCron() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer UEv4w+nT5Z7HdqDrNV8wRoyjF4umiTG02QkqLmUV7TM="
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Match cron failed");
      alert(`Match cron completed: ${data.message}\nPairs: ${data.pairs}\nTotal signups: ${data.totalSignups}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Time logic
  const eleven = new Date(now);
  eleven.setHours(11, 0, 0, 0);
  const seven = new Date(now);
  seven.setHours(7, 0, 0, 0);
  const after11 = now >= eleven;
  const before7 = now < seven;

  // UI logic
  let content;
  if (signedUp && !after11) {
    // Signed up, before 11am
    content = (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-green-700 text-center">You are in for today!</h1>
        <p className="text-gray-600 text-center">We will match you with a lunch buddy at 11 AM.</p>
        <div className="text-blue-700 text-lg font-mono">Matching in: <span className="font-bold">{countdown}</span></div>
      </div>
    );
  } else if (signedUp && after11) {
    // Signed up, after 11am
    content = (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-700 text-center">Your Match</h1>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {match !== null && (
          match ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4">
                <div className="text-green-800 text-lg font-medium">
                  {Array.isArray(match) ? match.join(' & ') : match}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-gray-600 text-lg mb-2">No match yet.</div>
              <div className="text-gray-500 text-sm">Please check back later.</div>
            </div>
          )
        )}
      </div>
    );
  } else if (!signedUp && after11) {
    // Not signed up, after 11am
    content = (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center">Signups are closed</h1>
        <p className="text-gray-600 text-center">Come back tomorrow at <span className="font-semibold">7:00 AM</span> to enter your name again.</p>
      </div>
    );
  } else {
    // Not signed up, before 11am
    content = (
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">Fork Friends 🍽️</h1>
        <p className="text-gray-600 text-center mb-4">Sign up to get matched for lunch today at Northeast Delta Dental!</p>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg text-gray-900 bg-white"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          maxLength={50}
          autoFocus
        />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Signing you up..." : "Sign Up"}
        </button>
      </form>
    );
  }

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 p-4`}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-6 border border-blue-100">
        {content}
      </div>
      {/* Temporary test button - remove in production */}
      {/* <div className="mt-4 pt-4 border-t border-gray-200 w-full">
          <button
            onClick={testMatchCron}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg py-2 transition-colors text-sm"
            disabled={loading}
          >
            {loading ? "Testing..." : "🧪 Test Match Cron"}
          </button>
          <p className="text-xs text-gray-500 text-center mt-1">Remove this button in production</p>
        </div> */}
      <footer className="mt-8 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Jason Zhu
      </footer>
    </div>
  );
}
