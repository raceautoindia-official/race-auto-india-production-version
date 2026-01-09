import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    // Extract user query from the latest message
    const userQuery = messages[0].content;

    // Split query into keywords for broader search
    const searchPattern = userQuery.split(" ").join("|");


  
    // Fetch relevant articles from the database
    const [articles]: any = await db.execute(
      "SELECT title, keywords FROM posts WHERE title RLIKE ? OR keywords RLIKE ? LIMIT 5", 
      [searchPattern, searchPattern]
    );

    // Prepare article summaries as context for ChatGPT
    const articleContext = articles.length > 0
      ? articles.map((a: any) => `Title: ${a.title}`).join("\n\n")
      : "No relevant articles found in Race Auto India’s database.";

    return NextResponse.json(articleContext);
  } catch (error) {
    console.error("Error in chatbot-gpt API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
