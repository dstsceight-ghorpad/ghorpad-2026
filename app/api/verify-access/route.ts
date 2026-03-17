import { NextResponse } from "next/server";

const ACCESS_CODE = process.env.SITE_ACCESS_CODE || "GHORPAD@DSTSC08";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (code === ACCESS_CODE) {
      const response = NextResponse.json({ success: true });
      // Set cookie for 30 days
      response.cookies.set("site_access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid access code" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
