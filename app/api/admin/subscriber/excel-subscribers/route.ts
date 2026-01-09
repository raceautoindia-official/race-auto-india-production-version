export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const [results] = await db.execute('SELECT * FROM subscriber_list')

        return NextResponse.json(results)
    }catch(err){
        console.log(err)
        return NextResponse.json(err,{status:500})
    }
}