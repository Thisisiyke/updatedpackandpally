import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { wanderlyUrl } from "@/lib/wanderly-config";
import { mapWanderlyUserToPackPally, setPackPallyAuthCookies } from "@/lib/packpally-session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const credential = String(body.credential || body.idToken || "").trim();
    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
    }

    const audiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    ].filter(Boolean) as string[];

    if (audiences.length === 0) {
      return NextResponse.json(
        { error: "Google Sign-In is not configured (set NEXT_PUBLIC_GOOGLE_CLIENT_ID)." },
        { status: 503 }
      );
    }

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: audiences,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json(
        { error: "Google did not return an email for this account." },
        { status: 400 }
      );
    }

    const firstName =
      (payload.given_name as string | undefined)?.trim() ||
      (payload.name?.split(" ")[0] ?? "Traveler");
    const lastName = (payload.family_name as string | undefined)?.trim() || "";
    const photo = (payload.picture as string | undefined) || "";

    const res = await fetch(wanderlyUrl("/signUp/signupWithApple"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email: payload.email.toLowerCase().trim(),
        appleUserId: "",
        photo,
      }),
    });

    const data = await res.json();
    if (data.status !== "success" || !data.token || !data.user) {
      return NextResponse.json(
        { error: data.message || data.error || "Google sign-in failed" },
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
    console.error("oauth/google", e);
    return NextResponse.json(
      { error: "Could not verify Google sign-in. Try again." },
      { status: 401 }
    );
  }
}
