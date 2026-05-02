import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  cookieBaseOptions,
  PP_USER_COOKIE,
  WANDERLY_ACCESS_COOKIE,
  WANDERLY_REFRESH_COOKIE,
} from "@/lib/wanderly-cookies";
import { wanderlyUrl } from "@/lib/wanderly-config";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(WANDERLY_ACCESS_COOKIE)?.value;
  try {
    if (token) {
      await fetch(wanderlyUrl("/signUp/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    /* ignore */
  }
  jar.set(WANDERLY_ACCESS_COOKIE, "", { ...cookieBaseOptions, maxAge: 0 });
  jar.set(WANDERLY_REFRESH_COOKIE, "", { ...cookieBaseOptions, maxAge: 0 });
  jar.set(PP_USER_COOKIE, "", { ...cookieBaseOptions, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
