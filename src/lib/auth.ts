import "server-only";

import { cookies } from "next/headers";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  isVerified?: string;
  stripeId?: string;
};

/**
 * Server-only session derived from Pack & Pally cookies (wanderly-1 identity).
 */
export async function auth(): Promise<{ user: SessionUser } | null> {
  const jar = await cookies();
  const raw = jar.get(PP_USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as SessionUser;
    if (!user?.id || !user?.email) return null;
    return { user };
  } catch {
    return null;
  }
}
