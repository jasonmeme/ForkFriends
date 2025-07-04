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

function getTomorrowStr() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getSignupTargetDate() {
  const now = new Date();
  const eleven = new Date(now);
  eleven.setHours(16, 0, 0, 0); // 11 AM converted to 4 PM for testing
  
  // If it's after 11 AM, signup for tomorrow
  if (now >= eleven) {
    return getTomorrowStr();
  }
  // Otherwise signup for today
  return getTodayStr();
}

function isSigningUpForTomorrow() {
  const now = new Date();
  const eleven = new Date(now);
  eleven.setHours(16, 0, 0, 0); // 11 AM converted to 4 PM for testing
  return now >= eleven;
}

function getNext11AM() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(16, 0, 0, 0);
  if (now > next) {
    // Already past 11am today
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function getBufferEndTime() {
  const eleven = new Date();
  eleven.setHours(16, 0, 0, 0);
  const bufferEnd = new Date(eleven);
  bufferEnd.setMinutes(bufferEnd.getMinutes() + 10); // 10 minute buffer
  return bufferEnd;
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
  const [isMatching, setIsMatching] = useState(false);
  const intervalRef = useRef();
  const matchPollingRef = useRef();

  // On mount, check localStorage for signup and name
  useEffect(() => {
    const storedDate = localStorage.getItem(SIGNUP_KEY);
    const storedName = localStorage.getItem(NAME_KEY);
    const targetDate = getSignupTargetDate();
    const fetchedToday = localStorage.getItem(MATCH_FETCHED_KEY) === getTodayStr();
    
    if (storedDate === targetDate && storedName) {
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
      eleven.setHours(16, 0, 0, 0);
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
    eleven.setHours(16, 0, 0, 0);
    const bufferEnd = getBufferEndTime();
    
    if (signedUp && now >= eleven && name && !matchFetched && !isMatching) {
      setIsMatching(true);
      startMatchPolling();
    }
    
    // Stop polling if we're past the buffer time
    if (isMatching && now > bufferEnd) {
      stopMatchPolling();
      setIsMatching(false);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedUp, now, name, matchFetched, isMatching]);

  const startMatchPolling = () => {
    // Initial fetch
    fetchMatch(name);
    
    // Set up polling every 5 seconds
    matchPollingRef.current = setInterval(() => {
      fetchMatch(name);
    }, 5000);
  };

  const stopMatchPolling = () => {
    if (matchPollingRef.current) {
      clearInterval(matchPollingRef.current);
      matchPollingRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopMatchPolling();
    };
  }, []);

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
      localStorage.setItem(SIGNUP_KEY, getSignupTargetDate());
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
      
      if (data.match !== null) {
        // Match found, stop polling
        setMatch(data.match);
        setMatchFetched(true);
        setIsMatching(false);
        stopMatchPolling();
        localStorage.setItem(MATCH_FETCHED_KEY, getTodayStr());
      }
      // If match is null, keep polling
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
  eleven.setHours(16, 0, 0, 0);
  const seven = new Date(now);
  seven.setHours(7, 0, 0, 0);
  const bufferEnd = getBufferEndTime();
  const after11 = now >= eleven;
  const before7 = now < seven;
  const inBufferPeriod = after11 && now <= bufferEnd;
  const signingUpForTomorrow = isSigningUpForTomorrow();
  const isAfterMidnight = now.getHours() < 7; // After midnight but before 7 AM

  // UI logic
  let content;
  if (signedUp && !after11) {
    // Signed up, before 11am
    const isSignedUpForToday = localStorage.getItem(SIGNUP_KEY) === getTodayStr();
    const waitingMessage = isSignedUpForToday 
      ? "You are in for today!"
      : "You are in for tomorrow!";
    const matchingMessage = isSignedUpForToday
      ? "We will match you with a lunch buddy at 11 AM."
      : "We will match you with a lunch buddy at 11 AM tomorrow.";
    
    content = (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-green-700 text-center">{waitingMessage}</h1>
        <p className="text-gray-600 text-center">{matchingMessage}</p>
        {isSignedUpForToday && (
          <div className="text-blue-700 text-lg font-mono">Matching in: <span className="font-bold">{countdown}</span></div>
        )}
      </div>
    );
  } else if (signedUp && after11 && isMatching) {
    // Signed up, after 11am, actively matching
    content = (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-700 text-center">Finding your match...</h1>
        <p className="text-gray-600 text-center">Please wait while we match you with lunch buddies.</p>
        <div className="text-blue-700 text-lg font-mono">Checking every 5 seconds...</div>
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
              <div className="mt-4 text-blue-600 font-medium">
                Message them on Webex!
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-gray-600 text-lg mb-2">No match found.</div>
              <div className="text-gray-500 text-sm">Please check back tomorrow.</div>
            </div>
          )
        )}
      </div>
    );
  } else if (!signedUp && signingUpForTomorrow) {
    // Not signed up, after 11am - signup for tomorrow
    const timeMessage = isAfterMidnight && now.getHours() < 7 
      ? "Sign up for today's lunch matching!"
      : isAfterMidnight 
        ? "Sign up for today's lunch matching at 11 AM!"
        : "Sign up for tomorrow's lunch matching!";
    
    content = (
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">🍽️ Fork Friend</h1>
        <p className="text-gray-600 text-center mb-4">{timeMessage}</p>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg text-gray-900 bg-white"
          placeholder="Enter your first and last name"
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
  } else {
    // Not signed up, before 11am - signup for today
    content = (
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">🍽️ Fork Friend</h1>
        <p className="text-gray-600 text-center mb-4">Sign up to get matched for lunch today at Northeast Delta Dental!</p>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg text-gray-900 bg-white"
          placeholder="Enter your first and last name"
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
