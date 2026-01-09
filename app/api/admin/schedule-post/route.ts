import { NextRequest, NextResponse } from "next/server";
import schedule from "node-schedule";

// Schedule job to run every 10 seconds

export async function POST(req: NextRequest) {
  try {
    const { scheduledAt } = await req.json();

    const publishTime = new Date(scheduledAt);

    schedule.scheduleJob(publishTime, async function () {
      console.log(`Publishing time ${publishTime}`);
    });
    return NextResponse.json("post scheduled success");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server err" }, { status: 500 });
  }
}
