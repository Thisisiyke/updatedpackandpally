import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  PP_SIGNUP_PENDING_COOKIE,
  PP_SIGNUP_VERIFIED_COOKIE,
  sealSignupBlob,
  signupVerifiedCookieOpts,
  unsealSignupBlob,
} from "@/lib/signup-verification-cookie";
import { validateSignupEmail } from "@/lib/auth-validation";

function skipEmailVerification(): boolean {
  return process.env.SIGNUP_SKIP_EMAIL_VERIFICATION === "true";
}

/** Confirms OTP matches server-stored value from send-email (OTP never sent to browser). */
export async function POST(req: Request) {
  if (skipEmailVerification()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const otp = String(body.otp || "").trim();

    if (!email || !validateSignupEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
    }

    const jar = await cookies();
    const pendingRaw = jar.get(PP_SIGNUP_PENDING_COOKIE)?.value;
    if (!pendingRaw) {
      return NextResponse.json(
        { error: "No verification pending. Send a new code first." },
        { status: 400 }
      );
    }

    const pending = unsealSignupBlob<{ email?: string; otp?: string; exp?: number }>(pendingRaw);
    if (
      !pending ||
      typeof pending.email !== "string" ||
      typeof pending.otp !== "string" ||
      typeof pending.exp !== "number"
    ) {
      jar.delete(PP_SIGNUP_PENDING_COOKIE);
      return NextResponse.json({ error: "Verification expired. Send a new code." }, { status: 400 });
    }

    if (pending.exp < Date.now()) {
      jar.delete(PP_SIGNUP_PENDING_COOKIE);
      return NextResponse.json({ error: "Code expired. Send a new code." }, { status: 400 });
    }

    if (pending.email !== email) {
      return NextResponse.json({ error: "Email does not match the code request." }, { status: 400 });
    }

    if (pending.otp !== otp) {
      return NextResponse.json({ error: "Invalid code. Try again." }, { status: 400 });
    }

    const verifiedUntil = Date.now() + 30 * 60 * 1000;
    jar.set(
      PP_SIGNUP_VERIFIED_COOKIE,
      sealSignupBlob({ email, exp: verifiedUntil }),
      signupVerifiedCookieOpts
    );
    jar.delete(PP_SIGNUP_PENDING_COOKIE);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
