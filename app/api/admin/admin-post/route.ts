// import db from "@/lib/db";
// import { RowDataPacket } from "mysql2";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const searchParams = new URLSearchParams(url.search);
//   const page: any = searchParams.get("page");

//   const limit = 10;
//   const offset = (page - 1) * limit;

//   let query = `
//     SELECT posts.id, posts.image_small, posts.title, posts.title_slug, posts.pageviews, posts.created_at, posts.featured_order, posts.slider_order,
//            posts.user_id, posts.is_slider, posts.is_breaking, posts.is_featured, posts.is_recommended,
//            posts.category_id, categories.color AS color, categories.name_slug AS name_slug,
//            categories.parent_id AS parent_id, categories.name AS sub_category,
//            users.username AS username
//     FROM posts
//     INNER JOIN users ON posts.user_id = users.id
//     INNER JOIN categories ON posts.category_id = categories.id
//     WHERE posts.is_scheduled = 0 AND posts.status = 1`;

//   let totalPostQuery = `
//   SELECT posts.id, posts.image_small, posts.title, posts.pageviews, posts.title_slug, posts.created_at,
//          posts.user_id, posts.is_slider, posts.is_breaking, posts.is_featured,
//          posts.category_id, categories.color AS color, categories.name_slug AS name_slug,
//          categories.parent_id AS parent_id, categories.name AS sub_category,
//          users.username AS username
//   FROM posts
//   INNER JOIN users ON posts.user_id = users.id
//   INNER JOIN categories ON posts.category_id = categories.id
//   WHERE posts.is_scheduled = 0 AND posts.status = 1`;

//   const queryParams: any = [];

//   query += ` ORDER BY posts.created_at DESC LIMIT 10 OFFSET ${offset}`;
//   try {
//     const [filteredRows] = await db.execute<RowDataPacket[]>(
//       query,
//       queryParams
//     );
//     const [totalPosts] = await db.execute<RowDataPacket[]>(
//       totalPostQuery,
//       queryParams
//     );

//     const [category] = await db.execute<RowDataPacket[]>(
//       `SELECT parent_id, name, name_slug, id FROM categories WHERE parent_id = 0`
//     );

//     const results = filteredRows.map((item) => {
//       const findParent = category.find((obj) => item.parent_id == obj.id);

//       if (findParent) {
//         return {
//           ...item,
//           main_category: findParent.name,
//           main_category_slug: findParent.name_slug,
//         };
//       } else {
//         return { ...item, main_category: null, main_category_slug: null };
//       }
//     });
//     return NextResponse.json({ data: results, totalPost: totalPosts.length });

//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json("Internal Server Error", { status: 500 });
//   }
// }

import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.search);

  // Extract filter parameters
  const page: any = searchParams.get("page") || 1;
  const userId: any = searchParams.get("username");
  const mainCategoryId: any = searchParams.get("mainCategory");
  const subCategoryId: any = searchParams.get("subCategory");
  const market: any = searchParams.get("market");
  const date: any = searchParams.get("createAt");

  const limit = 10;
  const offset = (page - 1) * limit;

  // Base query
  let query = `
    SELECT posts.id, posts.image_small, posts.title, posts.title_slug, posts.pageviews, posts.created_at, posts.featured_order, posts.slider_order,
           posts.user_id, posts.is_slider, posts.is_breaking, posts.is_featured, posts.is_recommended, 
           posts.category_id, categories.color AS color, categories.name_slug AS name_slug, 
           categories.parent_id AS parent_id, categories.name AS sub_category, 
           users.username AS username 
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id
    INNER JOIN categories ON posts.category_id = categories.id 
    WHERE posts.is_scheduled = 0 AND posts.status = 1
  `;

  let totalPostQuery = `
    SELECT COUNT(*) AS totalPosts
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id
    INNER JOIN categories ON posts.category_id = categories.id 
    WHERE posts.is_scheduled = 0 AND posts.status = 1
  `;

  const queryParams: any[] = [];
  const totalQueryParams: any[] = [];

  // Apply filters
  if (userId) {
    query += " AND posts.user_id = ?";
    totalPostQuery += " AND posts.user_id = ?";
    queryParams.push(userId);
    totalQueryParams.push(userId);
  }

  if (mainCategoryId && !subCategoryId) {
    query += " AND categories.parent_id = ?";
    totalPostQuery += " AND categories.parent_id = ?";
    queryParams.push(mainCategoryId);
    totalQueryParams.push(mainCategoryId);
  }

  if (mainCategoryId && subCategoryId) {
    query += " AND posts.category_id = ?";
    totalPostQuery += " AND posts.category_id = ?";
    queryParams.push(subCategoryId);
    totalQueryParams.push(subCategoryId);
  }

  if (!mainCategoryId && subCategoryId) {
    query += " AND posts.category_id = ?";
    totalPostQuery += " AND posts.category_id = ?";
    queryParams.push(subCategoryId);
    totalQueryParams.push(subCategoryId);
  }

  if (market) {
    query += " AND posts.market = ?";
    totalPostQuery += " AND posts.market = ?";
    queryParams.push(market);
    totalQueryParams.push(market);
  }

  if (date) {
    const filterdate = new Date(date); // Example date
    const filterMonthValue = filterdate.getMonth() + 1;
    const filterYearValue = filterdate.getFullYear();

    query += " AND MONTH(posts.created_at) = ? AND YEAR(posts.created_at) = ?";
    totalPostQuery +=
      " AND MONTH(posts.created_at) = ? AND YEAR(posts.created_at) = ?";
    queryParams.push(filterMonthValue, filterYearValue);
    totalQueryParams.push(filterMonthValue, filterYearValue);
  }
  // if (month) {
  //   query += " AND MONTH(posts.created_at) = ?";
  //   totalPostQuery += " AND MONTH(posts.created_at) = ?";
  //   queryParams.push(month);
  //   totalQueryParams.push(month);
  // }

  // Add pagination to main query
  query += ` ORDER BY posts.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  try {
    // Execute filtered queries
    const [filteredRows] = await db.execute<RowDataPacket[]>(
      query,
      queryParams
    );
    const [totalPosts] = await db.execute<RowDataPacket[]>(
      totalPostQuery,
      totalQueryParams
    );

    const totalPostCount = totalPosts[0]?.totalPosts || 0;

    // Fetch categories for mapping main_category
    const [category] = await db.execute<RowDataPacket[]>(
      `SELECT parent_id, name, name_slug, id FROM categories WHERE parent_id = 0`
    );

    const results = filteredRows.map((item) => {
      const findParent = category.find((obj) => item.parent_id == obj.id);

      if (findParent) {
        return {
          ...item,
          main_category: findParent.name,
          main_category_slug: findParent.name_slug,
        };
      } else {
        return { ...item, main_category: null, main_category_slug: null };
      }
    });

    return NextResponse.json({
      data: results,
      totalPost: totalPostCount,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
