export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [totalpostResult] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalPost FROM posts`
    );

    const [totaluserResult] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalUser FROM users`
    );

    const [totalNewsLetter] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS TotalMagazine FROM newsletter`
    );

    const [totalevent] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS TotalEvent FROM event`
    );

    // ✅ New: total free trial lead requests
    const [totalTrialLeadsResult] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS TotalTrialLeads FROM free_trial_leads`
    );

    const totalPost = totalpostResult[0]?.totalPost ?? 0;
    const totalUser = totaluserResult[0]?.totalUser ?? 0;
    const totalMagazine = totalNewsLetter[0]?.TotalMagazine ?? 0;
    const totalevents = totalevent[0]?.TotalEvent ?? 0;
    const totalTrialLeads = totalTrialLeadsResult[0]?.TotalTrialLeads ?? 0;

    return NextResponse.json({
      totalPost,
      totalUser,
      totalMagazine,
      totalevents,
      totalTrialLeads, // ✅ added
    });
  } catch (err: any) {
    console.log("Dashboard card-numbers API error:", err);

    // Optional safe fallback if free_trial_leads table is not yet created
    // (If you don't want fallback, remove this block)
    if (err?.code === "ER_NO_SUCH_TABLE") {
      try {
        const [totalpostResult] = await db.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS totalPost FROM posts`
        );

        const [totaluserResult] = await db.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS totalUser FROM users`
        );

        const [totalNewsLetter] = await db.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS TotalMagazine FROM newsletter`
        );

        const [totalevent] = await db.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS TotalEvent FROM event`
        );

        const totalPost = totalpostResult[0]?.totalPost ?? 0;
        const totalUser = totaluserResult[0]?.totalUser ?? 0;
        const totalMagazine = totalNewsLetter[0]?.TotalMagazine ?? 0;
        const totalevents = totalevent[0]?.TotalEvent ?? 0;

        return NextResponse.json({
          totalPost,
          totalUser,
          totalMagazine,
          totalevents,
          totalTrialLeads: 0,
        });
      } catch (fallbackErr) {
        console.log("Dashboard fallback error:", fallbackErr);
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}