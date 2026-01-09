import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt, size } = await req.json();

    if (!prompt || !size) {
      return NextResponse.json({ error: "Missing required parameters: prompt or size." }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size,
      n: 1,
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image." }, { status: 500 });
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
