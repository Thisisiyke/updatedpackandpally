"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  ShieldAlert,
  Check,
  Users,
  Download,
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
import { adminUsers } from "@/data/admin";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusConfig(status: string) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "suspended":
      return {
        label: "Suspended",
        class: "bg-red-100 text-red-800 border-red-200",
      };
    case "pending-verification":
      return {
        label: "Pending Verification",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    default:
      return { label: status, class: "" };
  }
}

function getRoleConfig(role: string) {
  switch (role) {
    case "admin":
      return { label: "Admin", class: "bg-red-100 text-red-800 border-red-200" };
    case "host":
      return {
        label: "Host",
        class: "bg-violet-100 text-violet-800 border-violet-200",
      };
    case "traveler":
      return {
        label: "Traveler",
        class: "bg-blue-100 text-blue-800 border-blue-200",
      };
    default:
      return { label: role, class: "" };
  }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = adminUsers.filter((u) => {
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: adminUsers.length,
    active: adminUsers.filter((u) => u.status === "active").length,
    suspended: adminUsers.filter((u) => u.status === "suspended").length,
    "pending-verification": adminUsers.filter(
      (u) => u.status === "pending-verification"
    ).length,
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Users
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage travelers and user accounts
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total users</p>
          <p className="text-2xl font-bold">{counts.all}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{counts.active}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{counts.suspended}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Pending verification</p>
          <p className="text-2xl font-bold text-amber-600">
            {counts["pending-verification"]}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "pending-verification", label: "Pending" },
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

        <div className="flex gap-1 rounded-lg border bg-white p-1">
          {[
            { value: "all", label: "All roles" },
            { value: "traveler", label: "Travelers" },
            { value: "host", label: "Hosts" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                roleFilter === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        {filtered.length > 0 ? (
          <>
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground bg-muted/30 uppercase tracking-wider">
              <div>User</div>
              <div>Role</div>
              <div>Status</div>
              <div>Bookings</div>
              <div>Lifetime value</div>
              <div></div>
            </div>

            <div className="divide-y">
              {filtered.map((user) => {
                const statusConfig = getStatusConfig(user.status);
                const roleConfig = getRoleConfig(user.role);

                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors"
                  >
                    {/* User */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover h-10 w-10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold truncate">{user.name}</p>
                          {user.verified && (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 sm:hidden">
                          {user.country} · Joined{" "}
                          {new Date(user.joinedAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="hidden sm:block">
                      <Badge className={cn("text-xs", roleConfig.class)}>
                        {roleConfig.label}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div>
                      <Badge className={cn("text-xs", statusConfig.class)}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Bookings */}
                    <div className="hidden sm:block text-sm">
                      <p className="font-semibold">{user.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">
                        Last: {new Date(user.lastActive).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="hidden sm:block">
                      <p className="font-semibold">
                        {formatCurrency(user.totalSpent)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4" />
                            Send email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCheck className="h-4 w-4" />
                            View profile
                          </DropdownMenuItem>
                          {!user.verified && (
                            <DropdownMenuItem>
                              <Check className="h-4 w-4" />
                              Manually verify
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {user.status === "active" ? (
                            <DropdownMenuItem variant="destructive">
                              <UserX className="h-4 w-4" />
                              Suspend account
                            </DropdownMenuItem>
                          ) : user.status === "suspended" ? (
                            <DropdownMenuItem>
                              <ShieldAlert className="h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
