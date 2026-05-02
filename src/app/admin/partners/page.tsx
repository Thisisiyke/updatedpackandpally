"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  Check,
  X,
  Building2,
  Star,
  MapPin,
  FileText,
  Mail,
  ShieldAlert,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminPartners } from "@/data/admin";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount}`;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "pending":
      return {
        label: "Pending Review",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "suspended":
      return {
        label: "Suspended",
        class: "bg-red-100 text-red-800 border-red-200",
      };
    case "rejected":
      return {
        label: "Rejected",
        class: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return { label: status, class: "" };
  }
}

export default function AdminPartnersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = adminPartners.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.company.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: adminPartners.length,
    verified: adminPartners.filter((p) => p.status === "verified").length,
    pending: adminPartners.filter((p) => p.status === "pending").length,
    suspended: adminPartners.filter((p) => p.status === "suspended").length,
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Partners
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage partner applications and verified sellers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total partners</p>
          <p className="text-2xl font-bold">{counts.all}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Verified</p>
          <p className="text-2xl font-bold text-emerald-600">
            {counts.verified}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Pending review</p>
          <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{counts.suspended}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "verified", label: "Verified" },
            { value: "suspended", label: "Suspended" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partners list */}
      <div className="space-y-3">
        {filtered.map((partner) => {
          const statusConfig = getStatusConfig(partner.status);
          const isPending = partner.status === "pending";

          return (
            <div
              key={partner.id}
              className={cn(
                "rounded-2xl border bg-white p-5 transition-all hover:shadow-sm",
                isPending && "border-amber-200 bg-amber-50/30"
              )}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* Partner info */}
                <div className="flex items-start gap-4 flex-1">
                  <Image
                    src={partner.avatar}
                    alt={partner.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover h-14 w-14 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold">{partner.name}</p>
                      <Badge className={cn("text-xs", statusConfig.class)}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{partner.company}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {partner.country} · {partner.email}
                    </p>
                    {partner.applicationNotes && (
                      <div className="mt-3 rounded-lg bg-white border p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Application notes
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {partner.applicationNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats (for verified/suspended) */}
                {partner.status !== "pending" && partner.totalListings > 0 && (
                  <div className="grid grid-cols-4 gap-3 sm:flex sm:gap-6 lg:flex-col lg:items-end lg:gap-1 lg:border-l lg:pl-6 shrink-0">
                    <div className="lg:text-right">
                      <p className="text-xs text-muted-foreground">Listings</p>
                      <p className="text-sm font-bold">{partner.totalListings}</p>
                    </div>
                    <div className="lg:text-right">
                      <p className="text-xs text-muted-foreground">Bookings</p>
                      <p className="text-sm font-bold">{partner.totalBookings}</p>
                    </div>
                    <div className="lg:text-right">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-sm font-bold">
                        {formatCurrency(partner.totalRevenue)}
                      </p>
                    </div>
                    <div className="lg:text-right">
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-0.5 lg:justify-end">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold">
                          {partner.rating || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4" />
                        Send message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4" />
                        View documents
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Building2 className="h-4 w-4" />
                        View listings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {partner.status === "verified" ? (
                        <DropdownMenuItem variant="destructive">
                          <ShieldAlert className="h-4 w-4" />
                          Suspend partner
                        </DropdownMenuItem>
                      ) : partner.status === "suspended" ? (
                        <DropdownMenuItem>
                          <Check className="h-4 w-4" />
                          Reinstate
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-white p-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No partners found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
