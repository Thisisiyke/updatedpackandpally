import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { wanderlyUrl } from "@/lib/wanderly-config";
import { mapWanderlyUserToPackPally, setPackPallyAuthCookies } from "@/lib/packpally-session";

const APPLE_JWKS = jose.createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idToken = String(body.idToken || "").trim();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();

    if (!idToken) {
      return NextResponse.json({ error: "Missing Apple identity token" }, { status: 400 });
    }

    const audience =
      process.env.APPLE_CLIENT_ID || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
    if (!audience) {
      return NextResponse.json(
        { error: "Apple Sign-In is not configured (set NEXT_PUBLIC_APPLE_CLIENT_ID)." },
        { status: 503 }
      );
    }

    const { payload } = await jose.jwtVerify(idToken, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience,
    });

    const sub = String(payload.sub || "");
    const email = String(payload.email || body.email || "").trim().toLowerCase();
    if (!sub || !email) {
      return NextResponse.json(
        {
          error:
            "Apple did not return enough information. Try again and share your email when prompted.",
        },
        { status: 400 }
      );
    }

    const res = await fetch(wanderlyUrl("/signUp/signupWithApple"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: firstName || "Apple",
        lastName: lastName || "User",
        email,
        appleUserId: sub,
        photo: "",
      }),
    });

    const data = await res.json();
    if (data.status !== "success" || !data.token || !data.user) {
      return NextResponse.json(
        { error: data.message || data.error || "Apple sign-in failed" },
        { status: res.ok ? 401 : res.status }
      );
    }

    const jar = await cookies();
    setPackPallyAuthCookies(jar, {
      token: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
    });

    const safe = mapWanderlyUserToPackPally(data.user as Record<string, unknown>);
    return NextResponse.json({ ok: true, user: safe });
  } catch (e) {
    console.error("oauth/apple", e);
    return NextResponse.json(
      { error: "Could not verify Apple sign-in. Try again." },
      { status: 401 }
    );
  }
}
