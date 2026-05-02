import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wanderlyFetch } from "@/lib/wanderly-server";
import { setPackPallyUserCookieOnly } from "@/lib/packpally-session";
import { stripWanderlyUserSecrets } from "@/lib/wanderly-public-user";
import { requireMemberSession } from "@/lib/require-member-session";

export async function POST(req: Request) {
  const session = await requireMemberSession();
  if (!session.ok) return session.response;

  const incoming = await req.formData();
  const file = incoming.get("images");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  const outbound = new FormData();
  outbound.append("images", file, (file as File).name || "profile.jpg");
  const preUrl = incoming.get("preUrl");
  if (typeof preUrl === "string" && preUrl.trim()) {
    outbound.append("preUrl", preUrl.trim());
  }

  const res = await wanderlyFetch(
    `/signUp/updateProfileimage/${encodeURIComponent(session.packUser.id)}`,
    { method: "POST", body: outbound }
  );

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json(
      { error: text?.slice(0, 200) || "Invalid response from upload service." },
      { status: 502 }
    );
  }

  if (!res.ok || data.status !== "success") {
    const msg =
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      "Upload failed.";
    return NextResponse.json({ error: msg }, { status: res.status >= 400 ? res.status : 502 });
  }

  const attrs = data.data as Record<string, unknown> | undefined;
  if (attrs && typeof attrs === "object") {
    const jar = await cookies();
    const { password: __, ...forCookie } = attrs;
    setPackPallyUserCookieOnly(jar, forCookie);
    return NextResponse.json({
      profile: stripWanderlyUserSecrets(attrs),
    });
  }

  return NextResponse.json({ ok: true });
}
