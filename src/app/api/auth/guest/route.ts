import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyUrl } from "@/lib/wanderly-config";
import {
  cookieBaseOptions,
  PP_USER_COOKIE,
  WANDERLY_ACCESS_COOKIE,
  WANDERLY_REFRESH_COOKIE,
} from "@/lib/wanderly-cookies";
import { decodeJwtPayload, mapWanderlyUserToPackPally } from "@/lib/packpally-session";

export async function POST() {
  try {
    const res = await fetch(wanderlyUrl("/signUp/guest-login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.status !== "success" || !data.token) {
      return NextResponse.json(
        { error: data.message || "Guest session could not be started" },
        { status: 502 }
      );
    }

    const payload = decodeJwtPayload<{ _id?: string; role?: string }>(data.token);
    const guestId = payload?._id || `guest_${Date.now()}`;

    const jar = await cookies();
    jar.set(WANDERLY_ACCESS_COOKIE, data.token, {
      ...cookieBaseOptions,
      maxAge: 15 * 60,
    });
    if (data.refreshToken) {
      jar.set(WANDERLY_REFRESH_COOKIE, data.refreshToken, {
        ...cookieBaseOptions,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    const guestUser = mapWanderlyUserToPackPally({
      _id: guestId,
      fullName: "Guest",
      email: "",
      profileImage: null,
      role: "guest",
    });

    jar.set(PP_USER_COOKIE, JSON.stringify(guestUser), {
      ...cookieBaseOptions,
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true, user: guestUser });
  } catch (e) {
    console.error("guest", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
