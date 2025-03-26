import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aarohan 2025 | Admin Dashboard",
  description: "Welcome to Aarohan 2025 - the 8th edition of IIT Ropar's premier sports fest! This yearts theme, \"Where Legends Are Made,\" embodies the relentless pursuit of greatness and the indomitable spirit of competition. Aarohan is more than a tournament — it is a crucible where resilience is tested, records are shattered, and legacies are forged. With intense rivalries, electrifying contests, and an atmosphere charged with adrenaline, this edition promises to be unforgettable. Whether you step onto the field, cheer from the stands, or witness history unfold, Aarohan 2025 is your stage. The stakes are high, the challenge is set — are you ready to carve your name into legend? See you where legends are made!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
