import { NextResponse } from "next/server";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { requireMemberSession } from "@/lib/require-member-session";
import { validateProfileEmail, validateProfilePassword } from "@/lib/profile-validation";

export async function POST(req: Request) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  const email = session.packUser.email?.trim().toLowerCase();
  if (!email || !validateProfileEmail(email)) {
    return NextResponse.json(
      { error: "Your account cannot change password (no email on file)." },
      { status: 400 }
    );
  }

  let body: { originalPassword?: string; newPassword?: string };
  try {
    body = (await req.json()) as { originalPassword?: string; newPassword?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const originalPassword = String(body.originalPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!originalPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current and new password are required." },
      { status: 400 }
    );
  }
  if (!validateProfilePassword(newPassword)) {
    return NextResponse.json(
      {
        error:
          "New password must be at least 8 characters and include upper, lower, number, and a special character (@$!%*?&).",
      },
      { status: 400 }
    );
  }

  const res = await wanderlyFetch("/signUp/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      originalPassword,
      newPassword,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
  };

  if (res.status === 401 || data.status === "invalid") {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  if (!res.ok || data.status !== "success") {
    return NextResponse.json(
      { error: data.message || "Could not change password." },
      { status: res.status >= 400 ? res.status : 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
