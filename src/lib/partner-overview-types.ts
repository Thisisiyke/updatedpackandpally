/** wanderly-1 POST /trips/getAdminDashboardStats — extended fields for Pack partner overview */
export type PartnerOverviewPayload = {
  status?: string;
  activeTripCount?: number;
  completedTripCount?: number;
  totalBookingsCount?: number;
  confirmedBookingsCount?: number;
  totalEarnings?: number;
  totalCollected?: number;
  pendingCollected?: number;
  avgOccupancyPct?: number;
  monthlyCollectedLast6?: { monthKey: string; label: string; amount: number }[];
  topTrips?: {
    tripId: string;
    revenue: number;
    tripName: string;
    coverImage: string;
  }[];
  recentBookings?: Record<string, unknown>[];
};
