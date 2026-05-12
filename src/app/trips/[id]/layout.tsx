import type { Metadata } from "next";
import { buildTripMetadata } from "@/lib/trip-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return buildTripMetadata(id, "/trips");
}

export default function TripIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
