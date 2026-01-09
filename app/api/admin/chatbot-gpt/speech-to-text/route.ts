import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = "https://api.openai.com/v1/audio/transcriptions";

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing." }, { status: 500 });
  }

  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Create payload for the OpenAI API
    const payload = new FormData();
    payload.append("file", file, file.name);
    payload.append("model", "whisper-1");

    // Fetch transcription from OpenAI's API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // Note: Do not set Content-Type; the browser will set it with the correct boundary when using FormData.
      },
      body: payload,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error.message || "Failed to transcribe audio." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
