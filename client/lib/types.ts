// Mirror of the live backend DTOs — do not rename fields.
// Field names here are copied from the Java DTOs on purpose.

export interface AuthResponse {
  token: string;
  username: string;
  name: string;
  avatarGradient: string;
}

export interface UserProfileResponse {
  username: string;
  name: string;
  bio: string | null;
  avatarGradient: string;
  gradeLabel: "FRESHMAN" | "SOPHOMORE" | "JUNIOR" | "SENIOR" | null;
  followerCount: number;
  followingCount: number;
  followedByCurrentUser: boolean;
}

export type GradeLabel = NonNullable<UserProfileResponse["gradeLabel"]>;

export const GRADE_LABELS: GradeLabel[] = ["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR"];

export interface SuggestionResponse {
  username: string;
  name: string;
  avatarGradient: string;
  following: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  color: string; // raw hex — compute readable text from luminance
  icon: string; // lucide-react component name as a string
  createdAt: string;
}

export interface Post {
  id: string;
  authorUsername: string;
  authorGradient: string;
  body: string;
  tag: string | null;
  mediaLabel: string | null;
  mediaGradient: string | null;
  likeCount: number;
  likedByCurrentUser: boolean;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorUsername: string;
  authorGradient: string;
  text: string;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorUsername: string;
  authorGradient: string;
  imageUrl: string;
  createdAt: string;
}

export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "STICKER";

export interface NotificationItem {
  id: string;
  actorUsername: string;
  actorGradient: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export type ConversationStatus =
  | "REQUEST"
  | "ACCEPTED"
  | "REJECTED"
  | "BLOCKED";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "FILE"
  | "VOICE";

export interface Conversation {
  id: string;
  otherUserId: string;
  username: string;
  name: string;
  avatarGradient: string;
  status: ConversationStatus;
  requestedBy: string;
  lastMessage?: string | null;
  lastMessageType?:  string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  clientMessageId: string | null;
  createdAt: string;
}

export interface SendMessageRequest {
  type: MessageType;
  content: string | null;
  clientMessageId?: string | null;
}

export interface ChatEvent {
  type: "MESSAGE";
  message: Message;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  typing: boolean;
}

export interface ReadEvent {
  conversationId: string;
  userId: string;
  readAt: string;
}