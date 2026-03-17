import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require the site access code
const PUBLIC_BYPASS = [
  "/access",           // The access code gate page itself
  "/api/verify-access", // The verification API
  "/api/validate-upload-token", // Upload token validation
  "/api/upload-photo",  // Photo upload API
  "/upload/photos",     // Photo upload page (has its own token auth)
  "/editorial/login",   // Editorial login page
  "/_next",             // Next.js assets
  "/favicon",           // Favicon
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip access check for bypassed routes and static assets
  const isBypassed = PUBLIC_BYPASS.some((p) => pathname.startsWith(p));
  if (isBypassed || pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?)$/)) {
    // Still protect editorial routes with Supabase auth
    if (pathname.startsWith("/editorial") && pathname !== "/editorial/login") {
      return handleEditorialAuth(request);
    }
    return NextResponse.next();
  }

  // ── Site Access Code Check ──────────────────────────────────────────────
  const accessCookie = request.cookies.get("site_access");
  if (!accessCookie || accessCookie.value !== "granted") {
    const accessUrl = new URL("/access", request.url);
    return NextResponse.redirect(accessUrl);
  }

  // ── Editorial Auth (Supabase) ───────────────────────────────────────────
  if (pathname.startsWith("/editorial") && pathname !== "/editorial/login") {
    return handleEditorialAuth(request);
  }

  return NextResponse.next();
}

async function handleEditorialAuth(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/editorial/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
