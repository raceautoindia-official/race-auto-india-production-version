import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, voice, format } = await req.json();

    if (!text || !voice || !format) {
      return NextResponse.json({ error: "Missing required parameters: text, voice, or format." }, { status: 400 });
    }

    const uniqueFilename = `speech-${uuidv4()}.${format.toLowerCase()}`;
    const tempFilePath = path.join(os.tmpdir(), uniqueFilename);

    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
    });

    const buffer:any = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(tempFilePath, buffer);

    const audioData = await fs.promises.readFile(tempFilePath);
    await fs.promises.unlink(tempFilePath); // Delete temp file after sending response

    return new NextResponse(audioData, {
      headers: {
        "Content-Type": `audio/${format.toLowerCase()}`,
        "Content-Disposition": `attachment; filename=${uniqueFilename}`,
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
