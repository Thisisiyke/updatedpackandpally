import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyUrl } from "@/lib/wanderly-config";
import {
  PP_SIGNUP_PENDING_COOKIE,
  PP_SIGNUP_VERIFIED_COOKIE,
  sealSignupBlob,
  signupPendingCookieOpts,
} from "@/lib/signup-verification-cookie";
import { validateSignupEmail } from "@/lib/auth-validation";

function skipEmailVerification(): boolean {
  return process.env.SIGNUP_SKIP_EMAIL_VERIFICATION === "true";
}

/** Mirrors wanderly RN: POST /signUp/send-SignupEmail — OTP stored server-side only. */
export async function POST(req: Request) {
  if (skipEmailVerification()) {
    return NextResponse.json(
      { ok: true, skipped: true, message: "Email verification skipped (dev)." },
      { status: 200 }
    );
  }

  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email || !validateSignupEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    let res: Response;
    try {
      res = await fetch(wanderlyUrl("/signUp/send-SignupEmail"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      return NextResponse.json(
        { error: "Cannot reach the API. Check API_BASE_URL and your network." },
        { status: 503 }
      );
    }

    let data: Record<string, unknown>;
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid response from signup service." }, { status: 502 });
    }

    const otpRaw = data.otp;
    const otpStr =
      otpRaw === undefined || otpRaw === null
        ? ""
        : String(otpRaw).replace(/\D/g, "").padStart(6, "0").slice(-6);

    if (data.status !== "success" || otpStr.length !== 6) {
      const msg =
        typeof data.message === "string"
          ? data.message
          : typeof data.error === "string"
            ? data.error
            : "Could not send verification email.";
      return NextResponse.json({ error: msg }, { status: res.status >= 400 ? res.status : 400 });
    }

    const jar = await cookies();
    const exp = Date.now() + 15 * 60 * 1000;
    const sealed = sealSignupBlob({
      email,
      otp: otpStr,
      exp,
    });
    jar.set(PP_SIGNUP_PENDING_COOKIE, sealed, signupPendingCookieOpts);
    jar.delete(PP_SIGNUP_VERIFIED_COOKIE);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
