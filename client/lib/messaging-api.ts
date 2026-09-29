import {Conversation, Message} from "./types";
import { api } from "./api";


export function getConversations(): Promise<Conversation[]> {
  return api<Conversation[]>("/messages/conversations");
}

export function createConversation(username: string): Promise<Conversation> {
  return api<Conversation>("/messages/conversations", {
    method: "POST",
    json: { username },
  });
}

export function getMessages(conversationId: string, page = 0, size = 30,): Promise<{ content: Message[] }> {
  return api<{ content: Message[] }>(`/messages/conversations/${conversationId}?page=${page}&size=${size}`,);
}

export function acceptConversation(conversationId: string,): Promise<void> {
  return api<void>(
    `/messages/conversations/${conversationId}/accept`,
    {
      method: "POST",
    },
  );
}

export function rejectConversation(conversationId: string,): Promise<void> {
  return api<void>(
    `/messages/conversations/${conversationId}/reject`,
    {
      method: "POST",
    },
  );
}

export function markConversationRead(conversationId: string,): Promise<void> {
  return api<void>(
    `/messages/conversations/${conversationId}/read`,
    {
      method: "PUT",
    },
  );
}

export function getUnReadCount(): Promise<void> {
  return api<void>(
    `/messages/unread-count/`,
    {
      method: "PUT",
    },
  );
}