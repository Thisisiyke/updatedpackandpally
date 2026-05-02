import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PP_USER_COOKIE } from "@/lib/wanderly-cookies";
import { wanderlyFetch } from "@/lib/wanderly-server";
import type { PackPallyUser } from "@/types/packpally-user";
import {
  wanderlyItemToTravelerDashboardBooking,
  type TravelerDashboardBooking,
} from "@/lib/wanderly-traveler-bookings";

/** Wanderly uses Query Limit + FilterExpression; first pages can be all non-matches — paginate. */
async function fetchBookingsByStatus(
  userId: string,
  status: string,
  opts?: { maxItems?: number; maxPages?: number }
): Promise<Record<string, unknown>[]> {
  const maxItems = opts?.maxItems ?? 200;
  const maxPages = opts?.maxPages ?? 80;
  const collected: Record<string, unknown>[] = [];
  let lastKey: string | null = null;

  for (let page = 0; page < maxPages && collected.length < maxItems; page++) {
    const q = new URLSearchParams({
      userId,
      status,
      limit: "50",
    });
    if (lastKey) {
      q.set("lastKey", lastKey);
    }
    const res = await wanderlyFetch(
      `/tripBookings/get-bookings-by-status?${q.toString()}`
    );
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(
        "[me/bookings] get-bookings-by-status failed",
        status,
        res.status,
        errBody.slice(0, 400)
      );
      break;
    }
    const data = (await res.json().catch(() => ({}))) as {
      items?: unknown[];
      lastKey?: string | null;
    };
    const items = Array.isArray(data.items)
      ? (data.items as Record<string, unknown>[])
      : [];
    collected.push(...items);

    const next = data.lastKey;
    if (
      next == null ||
      next === "" ||
      (typeof next === "string" && next === "null")
    ) {
      break;
    }
    lastKey = next;
  }

  return collected.slice(0, maxItems);
}

export async function GET() {
  const jar = await cookies();
  const raw = jar.get(PP_USER_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: PackPallyUser;
  try {
    user = JSON.parse(raw) as PackPallyUser;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = user?.id;
  if (!userId || user.role === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [booked, cancelled, completed] = await Promise.all([
      fetchBookingsByStatus(userId, "Booked"),
      fetchBookingsByStatus(userId, "Cancelled"),
      fetchBookingsByStatus(userId, "Completed"),
    ]);

    const merged = [...booked, ...cancelled, ...completed];
    const dedupe = new Map<string, Record<string, unknown>>();
    for (const item of merged) {
      const id = String(item._id ?? "");
      const ts = String(item.timestamp ?? "");
      dedupe.set(`${id}__${ts}`, item);
    }
    const unique = [...dedupe.values()].sort(
      (a, b) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0)
    );

    const bookings: TravelerDashboardBooking[] = unique.map(
      wanderlyItemToTravelerDashboardBooking
    );

    return NextResponse.json({ bookings });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 502 }
    );
  }
}
