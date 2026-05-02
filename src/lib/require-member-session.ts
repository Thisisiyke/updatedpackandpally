import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { PackPallyUser } from "@/types/packpally-user";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";
import { getWanderlyAccessTokenForBff } from "@/lib/ensure-wanderly-access-token";

export type MemberSession =
  | { ok: true; packUser: PackPallyUser }
  | { ok: false; response: NextResponse };

export async function requireMemberSession(): Promise<MemberSession> {
  const jar = await cookies();
  const raw = jar.get(PP_USER_COOKIE)?.value;
  if (!raw) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  let packUser: PackPallyUser;
  try {
    packUser = JSON.parse(raw) as PackPallyUser;
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!packUser.id || packUser.role === "guest") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sign in with a full account to manage your profile." },
        { status: 403 }
      ),
    };
  }
  const accessToken = await getWanderlyAccessTokenForBff();
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Session expired. Sign in again." },
        { status: 401 }
      ),
    };
  }
  return { ok: true, packUser };
}
