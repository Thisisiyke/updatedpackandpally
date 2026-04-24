"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  AlertTriangle,
  Clock,
  MessageSquare,
  FileText,
  Check,
  X,
  ArrowRight,
  Flame,
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminDisputes } from "@/data/admin";
import { cn } from "@/lib/utils";

function getStatusConfig(status: string) {
  switch (status) {
    case "open":
      return { label: "Open", class: "bg-red-100 text-red-800 border-red-200" };
    case "in-review":
      return {
        label: "In Review",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "resolved":
      return {
        label: "Resolved",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "escalated":
      return {
        label: "Escalated",
        class: "bg-violet-100 text-violet-800 border-violet-200",
      };
    default:
      return { label: status, class: "" };
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case "urgent":
      return {
        label: "Urgent",
        class: "bg-red-500 text-white",
        icon: Flame,
      };
    case "high":
      return {
        label: "High",
        class: "bg-orange-500 text-white",
        icon: CircleAlert,
      };
    case "medium":
      return {
        label: "Medium",
        class: "bg-amber-500 text-white",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Low",
        class: "bg-gray-400 text-white",
        icon: AlertTriangle,
      };
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "refund":
      return "Refund request";
    case "quality-issue":
      return "Quality issue";
    case "no-show":
      return "No-show";
    case "misrepresentation":
      return "Misrepresentation";
    case "other":
      return "Other";
    default:
      return type;
  }
}

export default function AdminDisputesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedDispute, setSelectedDispute] = useState(adminDisputes[0]?.id);

  const filtered = adminDisputes.filter((d) => {
    if (statusFilter === "active" && (d.status === "resolved")) return false;
    if (statusFilter !== "all" && statusFilter !== "active" && d.status !== statusFilter) return false;
    if (
      search &&
      !d.id.toLowerCase().includes(search.toLowerCase()) &&
      !d.userName.toLowerCase().includes(search.toLowerCase()) &&
      !d.reason.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const current = adminDisputes.find((d) => d.id === selectedDispute);

  const counts = {
    all: adminDisputes.length,
    active: adminDisputes.filter(
      (d) => d.status === "open" || d.status === "in-review"
    ).length,
    urgent: adminDisputes.filter((d) => d.priority === "urgent").length,
    resolved: adminDisputes.filter((d) => d.status === "resolved").length,
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Disputes & Refunds
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage active cases and customer complaints
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total cases</p>
          <p className="text-2xl font-bold">{counts.all}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-amber-600">{counts.active}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 border-red-200 bg-red-50/50">
          <p className="text-xs text-red-700">Urgent</p>
          <p className="text-2xl font-bold text-red-600">{counts.urgent}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600">{counts.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, user, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "active", label: "Active" },
            { value: "open", label: "Open" },
            { value: "in-review", label: "In Review" },
            { value: "escalated", label: "Escalated" },
            { value: "resolved", label: "Resolved" },
            { value: "all", label: "All" },
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="rounded-2xl border bg-white overflow-hidden lg:h-[calc(100vh-24rem)] lg:overflow-y-auto">
          <div className="divide-y">
            {filtered.map((dispute) => {
              const statusConfig = getStatusConfig(dispute.status);
              const priorityConfig = getPriorityConfig(dispute.priority);
              const PriorityIcon = priorityConfig.icon;
              const isSelected = selectedDispute === dispute.id;

              return (
                <button
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute.id)}
                  className={cn(
                    "w-full text-left p-4 transition-colors",
                    isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full shrink-0 mt-0.5",
                        priorityConfig.class
                      )}
                    >
                      <PriorityIcon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-muted-foreground">
                          {dispute.id}
                        </p>
                        <Badge className={cn("text-[10px]", statusConfig.class)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="font-semibold text-sm mt-1 truncate">
                        {dispute.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Image
                        src={dispute.userAvatar}
                        alt=""
                        width={20}
                        height={20}
                        className="rounded-full h-5 w-5 object-cover"
                      />
                      <span className="truncate">{dispute.userName}</span>
                    </div>
                    <span className="font-bold">
                      ${dispute.amount.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-semibold text-sm">No disputes found</p>
              <p className="text-xs text-muted-foreground mt-1">
                All clear for now
              </p>
            </div>
          )}
        </div>

        {/* Detail */}
        {current ? (
          <div className="rounded-2xl border bg-white p-6 lg:h-[calc(100vh-24rem)] lg:overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-sm text-muted-foreground">
                    {current.id}
                  </span>
                  <Badge className={cn("text-xs", getStatusConfig(current.status).class)}>
                    {getStatusConfig(current.status).label}
                  </Badge>
                  <Badge className={cn("text-xs", getPriorityConfig(current.priority).class)}>
                    {getPriorityConfig(current.priority).label} priority
                  </Badge>
                </div>
                <h2 className="text-xl font-bold">{current.reason}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Type: {getTypeLabel(current.type)} · Opened{" "}
                  {new Date(current.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 shrink-0">
                <Clock className="h-3.5 w-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-700">
                  SLA: {current.slaHours}h
                </span>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Complainant
                </p>
                <div className="flex items-center gap-2">
                  <Image
                    src={current.userAvatar}
                    alt={current.userName}
                    width={32}
                    height={32}
                    className="rounded-full h-8 w-8 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{current.userName}</p>
                    <p className="text-xs text-muted-foreground">Traveler</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Partner
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                    {current.partnerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{current.partnerName}</p>
                    <p className="text-xs text-muted-foreground">Partner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking info */}
            <div className="rounded-xl bg-muted/30 p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Booking</p>
              <p className="font-semibold mb-1">{current.bookingTitle}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>ID: {current.bookingId}</span>
                <span>·</span>
                <span className="font-bold text-foreground">
                  ${current.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-sm mb-2">Complaint details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Evidence & messages */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    {current.evidenceCount} evidence items
                  </p>
                  <p className="text-xs text-muted-foreground">View all</p>
                </div>
              </button>
              <button className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    {current.messageCount} messages
                  </p>
                  <p className="text-xs text-muted-foreground">View thread</p>
                </div>
              </button>
            </div>

            {/* Resolution actions */}
            {current.status !== "resolved" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <p className="font-bold text-sm text-amber-900 mb-3">
                  Resolution actions
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 w-full"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Refund guest
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 w-full">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Partial refund
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 w-full">
                    <X className="h-3.5 w-3.5" />
                    Deny claim
                  </Button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                    Request more info
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                    Escalate to senior
                  </Button>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="font-bold text-sm mb-3">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="h-10 w-px bg-border" />
                  </div>
                  <div className="flex-1 -mt-1">
                    <p className="font-medium">Dispute opened</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(current.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 -mt-1">
                    <p className="font-medium">Last update</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(current.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-16 text-center">
            <p className="text-muted-foreground">Select a dispute to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
