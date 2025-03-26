"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs } from "firebase/firestore";

export default function Home() {
  const [sport, setSport] = useState("");
  const [collegeData, setCollegeData] = useState([]);

  useEffect(() => {
    // get all documents from the "users" collection
    (async ()=>{
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      const usersMap = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (usersMap[data.collegeName]) {
          usersMap[data.collegeName].push(data);
        } else {
          usersMap[data.collegeName] = [data];
        }
      });
      // console.log(usersMap);

      const collegeData = Object.keys(usersMap).map((collegeName) => {
        const collegeData = usersMap[collegeName];
        const totalTeams = collegeData.length;
        let totalTeamMates = 0;
        collegeData.forEach((team) => {
          totalTeamMates += team.teammates.length + 1;
        });
        return { collegeName, totalTeams, totalTeamMates };
      });
      // console.log(collegeData);
      setCollegeData(collegeData);
    })()
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-4 font-bold ml-2">Registered Teams</h1>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Team Name
              </th>
              <th scope="col" className="px-6 py-3">
                Total Teams
              </th>
              <th scope="col" className="px-6 py-3">
                Contingent Size
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Download Team Data</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {collegeData.map((college, i) => (
              <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {college.collegeName}
                </th>
                <td className="px-6 py-4">
                  {college.totalTeams}
                </td>
                <td className="px-6 py-4">
                  {college.totalTeamMates}
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/download/college?collegeName=${college.collegeName}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Download</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        Download registered teams for sport:
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="inline mx-8 p-2 border border-white/40 rounded-lg bg-transparent  placeholder-white focus:ring-2 focus:ring-blue-300"
          required
        >
          <option className="text-grey-200" value="" disabled>
            Select a Sport
          </option>
          <option className="text-black" value="Athletics">
            Athletics
          </option>
          <option className="text-black" value="Basketball">
            Basketball
          </option>
          <option className="text-black" value="Badminton">
            Badminton
          </option>
          <option className="text-black" value="Cricket">
            Cricket
          </option>
          <option className="text-black" value="Chess">
            Chess
          </option>
          <option className="text-black" value="Football">
            Football
          </option>
          <option className="text-black" value="Hockey">
            Hockey
          </option>
          <option className="text-black" value="PowerLifting">
            Power Lifting
          </option>
          <option className="text-black" value="WeightLifting">
            Weight Lifting
          </option>
          <option className="text-black" value="Table Tennis">
            Table Tennis
          </option>
          <option className="text-black" value="Tennis">
            Tennis
          </option>
          <option className="text-black" value="Volleyball">
            Volleyball
          </option>
        </select>

        <a className="bg-green-500 px-6 py-2 text-white rounded-md hover:bg-green-800" href={`/download/sport?sport=${sport}`} target="_blank">Download</a>
      </div>
    </main>
  );
}
