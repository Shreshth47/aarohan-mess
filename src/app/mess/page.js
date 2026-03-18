"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import QrScanner from "qr-scanner";
import {db} from "@/lib/firebase";
import {
  collection,doc,
  addDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const MEALS = [
  {
    id: "breakfast",
    label: "Breakfast",
    icon: "🌅",
    time: "7:30 AM – 9:30 AM",
  },
  { id: "lunch", label: "Lunch", icon: "☀️", time: "12:30 PM – 2:30 PM" },
  { id: "dinner", label: "Dinner", icon: "🌙", time: "7:30 PM – 9:30 PM" },
];



export default function Mess() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [camAvailable, setCamAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const router = useRouter();

  // ─── Start camera once a meal is selected ──────────────────────────────────
  useEffect(() => {
    if (!selectedMeal) return;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setCamAvailable(true))
      .catch(() => setCamAvailable(false));

    return () => {
      scannerRef.current?.stop();
      scannerRef.current = null;
    };
  }, [selectedMeal]);

  // ─── Boot QR scanner once camera is available ──────────────────────────────
  useEffect(() => {
    if (!camAvailable || !videoRef.current || !selectedMeal) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      async (result) => {
        try {
          if (updating || scanned || error) return;
          qrScanner.pause();

          const user = JSON.parse(result.data.toString());
          await handleScan(user, qrScanner);
        } catch (err) {
          setError(err.toString());
          setUpdating(false);
          setScanned(false);
        }
      },
      { highlightScanRegion: true },
    );

    scannerRef.current = qrScanner;
    qrScanner.start();

    return () => {
      qrScanner.stop();
      scannerRef.current = null;
    };
  }, [camAvailable]);

  // ─── Core logic: duplicate check then write ────────────────────────────────
  async function handleScan(user, qrScanner) {
    setUpdating(true);

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const colRef = collection(db, "attendance");

    // Check for duplicate: same uid + same meal + same calendar day
    const dupQuery = query(
      colRef,
      where("uid", "==", user.uid),
      where("meal", "==", selectedMeal),
      where("date", "==", today),
    );
    const dupSnap = await getDocs(dupQuery);

    if (!dupSnap.empty) {
      setUpdating(false);
      setError("duplicate"); // special sentinel value
      return;
    }

    try {
      await addDoc(colRef, {
        uid: user.uid,
        name: user.name,
        college: user.college,
        meal: selectedMeal,
        date: today,
        timestamp: new Date().toISOString(),
      });

      setUpdating(false);
      setScanned(true);

      setTimeout(() => {
        setScanned(false);
        qrScanner.start();
      }, 2000);
    } catch (err) {
      setError(err.toString());
      setUpdating(false);
      qrScanner.start();
    }
  }

  function handleErrorDismiss() {
    setError(null);
    scannerRef.current?.start();
  }

  // ─── Go back to meal selection ─────────────────────────────────────────────
  function handleBack() {
    scannerRef.current?.stop();
    scannerRef.current = null;
    setCamAvailable(false);
    setSelectedMeal(null);
    setScanned(false);
    setError(null);
    setUpdating(false);
  }
  function goBack(){
    router.push('/');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  // ── 1. Meal selection screen ───────────────────────────────────────────────
  if (!selectedMeal) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-md">
        <button
          onClick={goBack}
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-center mb-2">Mess Attendance</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          Select the current meal to begin scanning
        </p>

        <div className="flex flex-col gap-4">
          {MEALS.map((meal) => (
            <button
              key={meal.id}
              onClick={() => setSelectedMeal(meal.id)}
              className="flex items-center gap-4 w-full p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-150 text-left"
            >
              <span className="text-4xl">{meal.icon}</span>
              <div>
                <p className="text-xl font-semibold">{meal.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {meal.time}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ── 2. Scanner screen ──────────────────────────────────────────────────────
  const currentMeal = MEALS.find((m) => m.id === selectedMeal);

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">
          {currentMeal.icon} {currentMeal.label}
        </h1>
        <span className="text-sm text-gray-400">{currentMeal.time}</span>
      </div>

      {/* Camera feed */}
      {camAvailable ? (
        <div className="relative overflow-hidden shadow-md rounded-2xl">
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      ) : (
        <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-20">
          Camera not available
        </p>
      )}

      {/* ── Overlays ─────────────────────────────────────────────────────── */}

      {/* Marking attendance */}
      {updating && (
        <Overlay>
          <p className="text-lg text-center">Marking attendance…</p>
        </Overlay>
      )}

      {/* Success */}
      {scanned && (
        <Overlay color="green">
          <span className="text-4xl mb-2">✅</span>
          <p className="text-lg text-center font-semibold">
            Attendance marked!
          </p>
        </Overlay>
      )}

      {/* Duplicate */}
      {error === "duplicate" && (
        <Overlay color="yellow">
          <span className="text-4xl mb-2">⚠️</span>
          <p className="text-xl font-bold text-center">
            Duplicates not Allowed!
          </p>
          <p className="text-sm text-center text-gray-600 mt-1">
            This student has already been marked for {currentMeal.label}.
          </p>
          <button
            onClick={handleErrorDismiss}
            className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            OK
          </button>
        </Overlay>
      )}

      {/* Generic error */}
      {error && error !== "duplicate" && (
        <Overlay color="red">
          <span className="text-4xl mb-2">❌</span>
          <p className="text-lg text-center">{error}</p>
          <button
            onClick={handleErrorDismiss}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            OK
          </button>
        </Overlay>
      )}
    </main>
  );
}

// ─── Reusable overlay ──────────────────────────────────────────────────────────
function Overlay({ children, color = "white" }) {
  const bg = {
    white: "bg-white text-gray-800",
    green: "bg-green-50 text-green-800",
    yellow: "bg-yellow-50 text-yellow-800",
    red: "bg-red-500 text-white",
  }[color];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className={`${bg} p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-xs w-full mx-4`}
      >
        {children}
      </div>
    </div>
  );
}
