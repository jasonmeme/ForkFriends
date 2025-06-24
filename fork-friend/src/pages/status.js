import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Status() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 p-4`}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-6 border border-blue-100">
        <h1 className="text-2xl font-bold text-green-700 mb-2 text-center">You're in for today!</h1>
        <p className="text-gray-600 text-center mb-4">We'll match you with a lunch buddy at 11 AM.</p>
        <Link href="/match" legacyBehavior>
          <a className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-6 transition-colors text-lg w-full text-center">Check your match</a>
        </Link>
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Northeast Delta Dental
      </footer>
    </div>
  );
} 