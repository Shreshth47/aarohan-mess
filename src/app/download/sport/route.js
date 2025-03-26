// nextjs api route to create an excel file which contains the data
// of all the colleges and their teams who have registered for a particular sport
// The data is fetched from the firestore database
// The data is then formatted and written to an excel file
// The excel file is then downloaded by the user
// The excel file contains the following columns:
// Team Name, College Name, Teammate Name, Teammate Email, Teammate Phone

// sport name is as given in the request query params


import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import { json2csv } from 'json-2-csv';

export async function GET(req) {
  const sport = req.nextUrl.searchParams.get("sport");
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);

  let i=0;
  let excelData = [];

  usersSnapshot.forEach((doc) => {
    const team = doc.data();
    if(team.leader.sports !== sport) return;
    i++;
    const rows = [];
    rows.push({
      college: team.collegeName,
      team: `Team ${i}`,
      name: team.leader.name, 
      email: team.leader.email, 
      phone: team.leader.Contact,
    });
    rows.push(...(team.teammates.map((teammate) => {
      return {
        college: '',
        team: '',
        name: teammate.name, 
        email: teammate.email, 
        phone: teammate.Contact,
      };
    })));
    excelData.push(rows);
  });

  excelData = excelData.flat();
  let csvData = await json2csv(excelData);
  return new NextResponse(csvData, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${sport}.csv`,
    },
  });
}