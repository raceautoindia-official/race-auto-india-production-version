import db from "@/lib/db";
import { NextResponse } from "next/server";

const BOILERPLATE_PATTERNS = [
  /RACE AUTO INDIA/gi,
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
  /Published in (?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
  /www\.[^\s]+/gi,
  /\+91[\s\-]?\d{10}/gi,
  /Mail:.*$/gim,
  /Race Editoriale LLP/gi,
  /All rights reserved/gi,
  /Contents/gi,
  /Disclaimer.*$/gim,
];

function cleanText(rawText) {
  let cleaned = rawText;
  for (const pattern of BOILERPLATE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Step 1: Clean input text
    const cleanedText = cleanText(text);
    console.log("✅ Cleaned Text:", cleanedText);

    if (!cleanedText || cleanedText.length < 10) {
      return NextResponse.json(
        { error: "Not enough meaningful content after cleaning." },
        { status: 400 }
      );
    }

    // Step 2: Generate title using OpenAI
    const openAiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a summarization assistant. Given text from a magazine page, output the best, shortest, most relevant title. Reply ONLY with the title. No explanations.",
            },
            {
              role: "user",
              content: `Magazine page text:\n\n${cleanedText}\n\nExtract best title:`,
            },
          ],
          max_tokens: 30,
          temperature: 0.2,
        }),
      }
    );

    const openAiData = await openAiRes.json();
    const optimizedTitle =
      openAiData?.choices?.[0]?.message?.content?.trim() || "";

    if (!optimizedTitle) {
      return NextResponse.json(
        { error: "Failed to generate title." },
        { status: 500 }
      );
    }

    console.log("✅ Optimized Title:", optimizedTitle);

    // Step 3: Search YouTube
    let youtubeVideos = [];
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const ytParams = new URLSearchParams({
        part: "snippet",
        q: optimizedTitle,
        type: "video",
        maxResults: "5",
        key: apiKey,
      });
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${ytParams}`
      );
      const ytData = await ytRes.json();

      youtubeVideos = (ytData.items || []).map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
      }));
    } catch (err) {
      console.error("YouTube search error:", err);
    }

    // Step 4: Extract brand/company name using GPT and search posts (only in title)
    let postResults = [];
    try {
      const brandRes = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You're a brand identifier. Given a title from a magazine article, return the most relevant brand, OEM, or company mentioned in it. If no clear brand is mentioned, return 'none'.",
              },
              {
                role: "user",
                content: `Title: "${optimizedTitle}"\n\nWhat is the main brand or company name mentioned?`,
              },
            ],
            max_tokens: 20,
            temperature: 0,
          }),
        }
      );

      const brandData = await brandRes.json();
      const brand =
        brandData?.choices?.[0]?.message?.content?.trim().toLowerCase() || "";

      if (brand && brand !== "none") {
        const [rows] = await db.execute(
          `
          SELECT id, title, title_slug, summary, image_mid
          FROM posts
          WHERE LOWER(title) LIKE ?
          ORDER BY id DESC
          LIMIT 5
          `,
          [`%${brand}%`]
        );

        postResults = rows.map((row) => ({
          id: row.id,
          title: row.title,
          title_slug: row.title_slug,
          summary: row.summary,
          image: row.image_mid,
        }));
      }
    } catch (err) {
      console.error("Brand-specific post search error:", err);
    }

    return NextResponse.json({
      optimizedTitle,
      youtubeVideos,
      postResults,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
