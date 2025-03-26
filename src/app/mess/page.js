"use client";
import { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, getDoc } from "firebase/firestore";

export default function Mess() {
  const [camAvailable, setCamAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);


  async function updateAttendance(userData, qrScanner){
    setUpdating(true);
    let attendanceCollection = collection(db, "attendance");
    let date = new Date();
    let attendanceData = {
      uid: userData.uid,
      name: userData.name,
      college: userData.college,
      timestamp: date.toISOString(),
    };
    // add a new document to the "attendance" collection
    // with the data of the user who scanned the QR code
    // and the timestamp when the QR code was scanned
    try{
      await addDoc(attendanceCollection, attendanceData);
      setUpdating(false);
      setScanned(true);
      setTimeout(() => {
        setScanned(false);
        qrScanner.start();
      }, 2000);
    }catch(error){
      setError(error.toString());
      setUpdating(false);
      setScanned(false);
      qrScanner.start();
    }
  }


  useEffect(() => {
    let qrScanner;

    if (!camAvailable){
      navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
        setCamAvailable(true);
      }).catch(() => {
        setCamAvailable(false);
      });
    }

    if (camAvailable && videoRef.current) {
      qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          try {
            if(updating || scanned || error) return;
            qrScanner.pause();
            const user = JSON.parse(result.data.toString());
            // const userDoc = doc(db, "users", user.uid);
            // const userDocSnapshot = await getDoc(userDoc);
            // if (!userDocSnapshot.exists()) {
            //   alert("User not found");
            //   return;
            // }
            // const userData = userDocSnapshot.data();
            updateAttendance(user, qrScanner);
          } catch (error) {
            setError(error.toString());
            setUpdating(false);
            setScanned(false);
          }
        },
        { highlightScanRegion: true }
      );

      qrScanner.start();
    }

    return () => {
      if (qrScanner) qrScanner.stop();
    };
  }, [camAvailable]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-4 font-bold ml- text-center">Mess Attendance</h1>
      {camAvailable && <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
      </div>}
      {!camAvailable && <p className="text-center text-lg text-gray-500 dark:text-gray-400">Camera not available</p>}

      {updating && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg text-black">
          <p className="text-lg text-center">Marking attendance...</p>
        </div>
      </div>}

      {scanned && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg text-black">
          <p className="text-lg text-center">Attendance marked successfully</p>
        </div>
      </div>}

      {error && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-red-500 p-4 rounded-lg text-white flex flex-col">
          <p className="text-lg text-center">{error}</p>
          <button className="self-end font-extrabold" onClick={()=>{setError(null)}}>OK</button>
        </div>
      </div>}
    </main>
  );
}
