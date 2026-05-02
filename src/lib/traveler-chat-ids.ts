export const DM_PREFIX = "dm:" as const;
export const GROUP_PREFIX = "group:" as const;

export function dmConversationId(peerWanderlyId: string) {
  return `${DM_PREFIX}${peerWanderlyId}`;
}

export function groupConversationId(tripId: string) {
  return `${GROUP_PREFIX}${tripId}`;
}

export function parseConversationRouteId(
  id: string
):
  | { kind: "direct"; peerId: string }
  | { kind: "group"; tripId: string }
  | null {
  if (id.startsWith(DM_PREFIX)) {
    return { kind: "direct", peerId: id.slice(DM_PREFIX.length) };
  }
  if (id.startsWith(GROUP_PREFIX)) {
    return { kind: "group", tripId: id.slice(GROUP_PREFIX.length) };
  }
  return null;
}
