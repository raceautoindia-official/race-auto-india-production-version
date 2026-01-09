import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { pathname } = new URL(req.url);
        const year: any = pathname.split("/").pop();

        const [results] = await db.execute<RowDataPacket[]>(
            `SELECT category_id, created_at FROM posts`
        );

        const postCountsByMonth: { [key: number]: number } = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
        };

        results.forEach((item) => {
            const dateString = item.created_at;
            const yeardate = new Date(dateString);
            const DByear = yeardate.getFullYear();

            if (year == DByear) {
                const timestamp = item.created_at;
                const date = new Date(timestamp);
                const month = date.getMonth() + 1;

                postCountsByMonth[month] = (postCountsByMonth[month] || 0) + 1;
            }
        });

        return NextResponse.json(postCountsByMonth)
    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 })
    }
}