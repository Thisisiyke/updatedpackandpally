import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyUrl } from "@/lib/wanderly-config";
import {
  validateSignupEmail,
  validateSignupName,
  validateSignupPassword,
} from "@/lib/auth-validation";
import {
  PP_SIGNUP_PENDING_COOKIE,
  PP_SIGNUP_VERIFIED_COOKIE,
  unsealSignupBlob,
} from "@/lib/signup-verification-cookie";

function skipEmailVerification(): boolean {
  return process.env.SIGNUP_SKIP_EMAIL_VERIFICATION === "true";
}

async function assertEmailVerifiedForSignup(emailLower: string): Promise<{ ok: true } | { error: string }> {
  if (skipEmailVerification()) return { ok: true };

  const jar = await cookies();
  const raw = jar.get(PP_SIGNUP_VERIFIED_COOKIE)?.value;
  if (!raw) {
    return { error: "Verify your email with the code we sent before creating an account." };
  }
  const v = unsealSignupBlob<{ email?: string; exp?: number }>(raw);
  if (!v || typeof v.email !== "string" || typeof v.exp !== "number") {
    jar.delete(PP_SIGNUP_VERIFIED_COOKIE);
    return { error: "Verification expired. Start again from send email." };
  }
  if (v.exp < Date.now()) {
    jar.delete(PP_SIGNUP_VERIFIED_COOKIE);
    return { error: "Verification expired. Verify your email again." };
  }
  if (v.email !== emailLower) {
    return { error: "Verified email does not match this form." };
  }
  return { ok: true };
}

/**
 * Wanderly flow (matches RN): POST signupDetails only — no automatic login.
 * After success, user signs in via /login (session cookies set there).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!validateSignupName(firstName)) {
      return NextResponse.json(
        { error: "First name must be 2–50 characters (letters, spaces, hyphen, apostrophe)." },
        { status: 400 }
      );
    }
    if (!validateSignupName(lastName)) {
      return NextResponse.json(
        { error: "Last name must be 2–50 characters (letters, spaces, hyphen, apostrophe)." },
        { status: 400 }
      );
    }
    if (!validateSignupEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!validateSignupPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters (max 128)." },
        { status: 400 }
      );
    }

    const verified = await assertEmailVerifiedForSignup(email);
    if ("error" in verified) {
      return NextResponse.json({ error: verified.error }, { status: 400 });
    }

    let reg: Response;
    try {
      reg = await fetch(wanderlyUrl("/signUp/signupDetails"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
    } catch {
      return NextResponse.json(
        { error: "Cannot reach the API. Check WANDERLY_API_BASE_URL and your network." },
        { status: 503 }
      );
    }

    let regData: Record<string, unknown>;
    try {
      regData = (await reg.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid response from signup service." }, { status: 502 });
    }

    if (regData.status === "failed") {
      return NextResponse.json(
        { error: (regData.message as string) || "Signup failed" },
        { status: reg.status >= 400 ? reg.status : 400 }
      );
    }

    const jar = await cookies();
    jar.delete(PP_SIGNUP_VERIFIED_COOKIE);
    jar.delete(PP_SIGNUP_PENDING_COOKIE);

    return NextResponse.json(
      {
        ok: true,
        needsLogin: true,
        message:
          typeof regData.message === "string"
            ? regData.message
            : "Account created. Sign in with your email and password.",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
