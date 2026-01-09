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

        const totalPost = totalpostResult[0]?.totalPost ?? 0;
        const totalUser = totaluserResult[0]?.totalUser ?? 0;
        const totalMagazine = totalNewsLetter[0]?.TotalMagazine ?? 0;
        const totalevents = totalevent[0]?.TotalEvent ?? 0;

        return NextResponse.json({ totalPost, totalUser, totalMagazine, totalevents })
    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}