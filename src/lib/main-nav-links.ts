import { navLinks } from "@/lib/constants";
import type { PackPallyUser } from "@/types/packpally-user";
import { isPackPallyHostUser } from "@/lib/host-access";

/** Match wanderly native: AdminHeader.tsx ("Switch to User"), MoreScreen.tsx ("Switch to Host Mode"). */
export const SWITCH_TO_USER_LABEL = "Switch to User";
export const SWITCH_TO_HOST_MODE_LABEL = "Switch to Host Mode";

export type MainNavLink = { label: string; href: string };

export function getMainNavLinks(
  pathname: string,
  user: PackPallyUser | null | undefined
): MainNavLink[] {
  const isPartnerArea =
    pathname === "/partner" || pathname.startsWith("/partner/");
  const isHost = isPackPallyHostUser(user);

  return navLinks.map((link) => {
    if (link.href !== "/become-a-host") return link;
    if (isHost) {
      return isPartnerArea
        ? { label: SWITCH_TO_USER_LABEL, href: "/dashboard" }
        : { label: SWITCH_TO_HOST_MODE_LABEL, href: "/partner" };
    }
    return link;
  });
}
