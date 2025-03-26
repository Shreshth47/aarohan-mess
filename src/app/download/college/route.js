// nextjs api route to create an excel file which contains the data
// of all the colleges and their teams
// The data is fetched from the firestore database
// The data is then formatted and written to an excel file
// The excel file is then downloaded by the user
// The excel file contains the following columns:
// Sport
// Teammate Name
// Teammate Email
// Teammate Phone Number

// the data should be grouped by sport
// the data should be sorted by teammate name
// college name is as given in the request query params


import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import { json2csv } from 'json-2-csv';

export async function GET(req) {
  const collegeName = req.nextUrl.searchParams.get("collegeName");
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

  const collegeData = usersMap[collegeName];

  let i=0;
  const excelData = collegeData.map((team) => {
    i++;
    const sport = team.leader.sports;
    const rows = [];
    rows.push({
      team: `Team ${i}`,
      sport,
      name: team.leader.name, 
      email: team.leader.email, 
      phone: team.leader.Contact,
    });
    rows.push(...(team.teammates.map((teammate) => {
      return {
        team: '',
        sport: '',
        name: teammate.name, 
        email: teammate.email, 
        phone: teammate.Contact,
      };
    })));
    return rows;
  }).flat();

  
  let csvData = await json2csv(excelData);
  return new NextResponse(csvData, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${collegeName}.csv`,
    },
  }); 
}