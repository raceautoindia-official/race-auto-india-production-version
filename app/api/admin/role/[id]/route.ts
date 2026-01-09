import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const [results] = await db.execute(
      "SELECT * FROM roles_permissions WHERE id = ?",
      [id]
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();

  const roleData = await req.json();

  const role = roleData.role_name.toLowerCase();

  try {
    const values = [
      role,
      roleData.role_name,
      roleData.admin_panel,
      roleData.add_post,
      roleData.manage_all_posts,
      roleData.navigation,
      roleData.pages,
      roleData.rss_feeds,
      roleData.categories,
      roleData.widgets,
      roleData.polls,
      roleData.gallery,
      roleData.comments_contact,
      roleData.newsletter,
      roleData.ad_spaces,
      roleData.users,
      roleData.seo_tools,
      roleData.settings,
      roleData.reward_system,
      roleData.market,
      roleData.event,
      roleData.subscription,
      id,
    ];

    await db.execute(
      `
        UPDATE roles_permissions
        SET role = ?,
        role_name = ?,
        admin_panel = ?,
            add_post = ?,
            manage_all_posts = ?,
            navigation = ?,
            pages = ?,
            rss_feeds = ?,
            categories = ?,
            widgets = ?,
            polls = ?,
            gallery = ?,
            comments_contact = ?,
            newsletter = ?,
            ad_spaces = ?,
            users = ?,
            seo_tools = ?,
            settings = ?,
            reward_system = ?,
            market = ?,
            event = ?,
            subscription = ?
        WHERE id = ?`,
      values
    );

    return NextResponse.json("updated success");
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
