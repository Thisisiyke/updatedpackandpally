import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  PP_USER_COOKIE,
  WANDERLY_ACCESS_COOKIE,
  WANDERLY_REFRESH_COOKIE,
} from "@/lib/wanderly-cookies";
import { wanderlyUrl } from "@/lib/wanderly-config";
import type { PackPallyUser } from "@/types/packpally-user";

export async function GET() {
  const jar = await cookies();
  const raw = jar.get(PP_USER_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = JSON.parse(raw) as PackPallyUser;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

/** Refresh wanderly access token using httpOnly refresh cookie. */
export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(WANDERLY_REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }
  try {
    const res = await fetch(wanderlyUrl("/signUp/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    const data = await res.json();
    if (!data.accessToken) {
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }
    jar.set(WANDERLY_ACCESS_COOKIE, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
