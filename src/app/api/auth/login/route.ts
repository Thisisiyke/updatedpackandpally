import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyUrl } from "@/lib/wanderly-config";
import { mapWanderlyUserToPackPally, setPackPallyAuthCookies } from "@/lib/packpally-session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    let res: Response;
    try {
      res = await fetch(wanderlyUrl("/signUp/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return NextResponse.json(
        { error: "Cannot reach the API. Check WANDERLY_API_BASE_URL and your network." },
        { status: 503 }
      );
    }

    let data: Record<string, unknown>;
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid response from login service." }, { status: 502 });
    }

    if (data.status === "notExist") {
      return NextResponse.json({ error: "No account found for this email." }, { status: 401 });
    }
    if (data.status === "invalid") {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
    if (data.status !== "success" || !data.token) {
      const msg =
        typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : "Login failed";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const jar = await cookies();
    setPackPallyAuthCookies(jar, {
      token: data.token as string,
      refreshToken: data.refreshToken as string | undefined,
      user: (data.user || {}) as Record<string, unknown>,
    });

    const safe = mapWanderlyUserToPackPally((data.user || {}) as Record<string, unknown>);
    return NextResponse.json({ ok: true, user: safe });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
