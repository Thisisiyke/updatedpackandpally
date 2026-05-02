import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { setPackPallyUserCookieOnly } from "@/lib/packpally-session";
import { stripWanderlyUserSecrets } from "@/lib/wanderly-public-user";
import { requireMemberSession } from "@/lib/require-member-session";
import {
  validateProfileBio,
  validateProfileEmail,
  validateProfileFirstName,
  validateProfileLastName,
  validateProfilePhone,
} from "@/lib/profile-validation";

export async function GET() {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  const email = session.packUser.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Your account has no email on file." },
      { status: 400 }
    );
  }

  const res = await wanderlyFetch("/signUp/getLoginData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    user?: Record<string, unknown>;
  };

  if (!res.ok || data.status !== "success" || !data.user) {
    return NextResponse.json(
      { error: "Could not load profile." },
      { status: res.status === 401 ? 401 : 502 }
    );
  }

  if (String(data.user._id) !== session.packUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const jar = await cookies();
  const rawUser = data.user as Record<string, unknown>;
  const { password: __pw, ...forCookie } = rawUser;
  setPackPallyUserCookieOnly(jar, forCookie);

  return NextResponse.json({
    profile: stripWanderlyUserSecrets(rawUser),
  });
}

export async function PATCH(req: Request) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const bioRaw = String(body.bio ?? "");

  const email = session.packUser.email?.trim().toLowerCase() || "";

  if (!validateProfileFirstName(firstName)) {
    return NextResponse.json(
      { error: "First name must be 2–50 letters, spaces, apostrophes, or hyphens." },
      { status: 400 }
    );
  }
  if (!validateProfileLastName(lastName)) {
    return NextResponse.json(
      { error: "Last name must be 2–50 letters, spaces, apostrophes, or hyphens." },
      { status: 400 }
    );
  }
  if (!email || !validateProfileEmail(email)) {
    return NextResponse.json(
      { error: "Your account has no valid email on file." },
      { status: 400 }
    );
  }
  if (!validateProfilePhone(phone)) {
    return NextResponse.json(
      { error: "Phone must be 7–15 digits, or leave blank." },
      { status: 400 }
    );
  }
  if (!validateProfileBio(bioRaw)) {
    return NextResponse.json(
      { error: "Bio must be 300 characters or less (no HTML)." },
      { status: 400 }
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const payload: Record<string, string> = {
    _id: session.packUser.id,
    firstName,
    lastName,
    fullName,
    email,
    phone,
    bio: bioRaw.replace(/<[^>]*>/g, "").trim(),
  };

  const res = await wanderlyFetch("/signUp/updateSignUp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    data?: Record<string, unknown>;
    message?: string;
  };

  if (!res.ok || data.status !== "success" || !data.data) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : "Could not update profile.";
    return NextResponse.json({ error: msg }, { status: res.status >= 400 ? res.status : 502 });
  }

  const jar = await cookies();
  const { password: __, ...forCookie } = data.data as Record<string, unknown>;
  setPackPallyUserCookieOnly(jar, forCookie);

  return NextResponse.json({
    profile: stripWanderlyUserSecrets(data.data as Record<string, unknown>),
  });
}
