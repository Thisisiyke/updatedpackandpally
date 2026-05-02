import { NextResponse } from "next/server";

/** Lets the signup UI skip OTP steps when SIGNUP_SKIP_EMAIL_VERIFICATION=true (local/dev). */
export async function GET() {
  return NextResponse.json({
    skipEmailVerification: process.env.SIGNUP_SKIP_EMAIL_VERIFICATION === "true",
  });
}
