"use client";

import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getToken } from "./api";



export type ChatEvent = {
  event: "MESSAGE_CREATED" | "TYPING_STARTED" | "TYPING_STOPPED" | "MESSAGES_READ" | "REQUEST_ACCEPTED";
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    type: string;
    content: string | null;
    clientMessageId: string | null;
    createdAt: string;
  } | null;
  actorId: string;
  timestamp: string;
};

export function createMessagingSocket(
  onEvent: (event: ChatEvent) => void,
  onConnected?: () => void,
  onDisconnected?: () => void,
) {
  const token = getToken();

  const client = new Client({
    brokerURL:
      process.env.NEXT_PUBLIC_WS_URL ??
      "ws://localhost:8080/ws",

    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : "",
    },

    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      client.subscribe("/user/queue/messages", (message: IMessage) => {
        onEvent(JSON.parse(message.body));
      });

      client.subscribe("/user/queue/typing", (message: IMessage) => {
        onEvent(JSON.parse(message.body));
      });

      client.subscribe("/user/queue/read", (message: IMessage) => {
        onEvent(JSON.parse(message.body));
      });

      client.subscribe("/user/queue/requests", (message: IMessage) => {
        onEvent(JSON.parse(message.body));
      });

      onConnected?.();
    },

    onWebSocketClose: () => {
      onDisconnected?.();
    },
  });

  client.activate();

  return {
    client,

    sendMessage(payload: {
      conversationId: string;
      type: "TEXT";
      content: string;
      clientMessageId: string;
    }) {
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });
    },

    sendTyping(conversationId: string, typing: boolean) {
      client.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          conversationId,
          typing,
        }),
      });
    },

    markRead(conversationId: string) {
      client.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({
          conversationId,
        }),
      });
    },

    acceptRequest(conversationId: string) {
      client.publish({
        destination: "/app/chat.accept",
        body: JSON.stringify({
          conversationId,
        }),
      });
    },

    disconnect() {
      client.deactivate();
    },
  };
}
