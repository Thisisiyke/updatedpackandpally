import type { PackPallyUser } from "@/types/packpally-user";

/** Full account session — not anonymous and not “continue as guest”. */
export function isPackPallyMember(
  user: PackPallyUser | null | undefined
): boolean {
  if (!user) return false;
  if (user.role === "guest") return false;
  return true;
}
