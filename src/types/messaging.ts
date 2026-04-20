export type ParticipantRole = "traveler" | "host" | "partner";

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: ParticipantRole;
  online?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  tripTitle?: string;
  tripImage?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastSenderId?: string;
  unreadCount: number;
}
