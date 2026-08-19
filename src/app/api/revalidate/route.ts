import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PATHS = [
  "/",
  "/about",
  "/testimonials",
  "/sustainability",
  "/trade-program",
  "/careers",
  "/showrooms",
  "/contact",
  "/custom",
  "/admin/inspirations",
  "/admin/content",
];

/**
 * Called after admin CMS saves so storefront pages pick up fresh content.
 */
export async function POST(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  let extraPaths: string[] = [];
  try {
    const body = (await request.json()) as { paths?: string[] };
    if (Array.isArray(body.paths)) {
      extraPaths = body.paths.filter((path) => typeof path === "string" && path.startsWith("/"));
    }
  } catch {
    // body optional
  }

  const paths = Array.from(new Set([...DEFAULT_PATHS, ...extraPaths]));

  try {
    revalidateTag("site-content", "max");
    for (const path of paths) {
      revalidatePath(path);
    }
  } catch {
    try {
      revalidatePath("/");
      revalidatePath("/testimonials");
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true, revalidated: true, paths });
}
