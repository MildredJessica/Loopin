import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getToken } from "./api";
import type { Message } from "./types";

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

export interface RequestEvent {
  conversationId: string;
  userId: string;
  status: "REQUEST" | "ACCEPTED" | "REJECTED" | "BLOCKED";
}

export interface ChatSendRequest {
  conversationId: string;
  type: "TEXT";
  content: string;
  clientMessageId?: string | null;
}

export interface MessagingWebSocketHandlers {
  onMessage?: (message: Message) => void;
  onTyping?: (event: TypingEvent) => void;
  onRead?: (event: ReadEvent) => void;
  onRequest?: (event: RequestEvent) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export class MessagingWebSocket {
  private client: Client | null = null;

  private subscriptions: StompSubscription[] = [];

  connect(handlers: MessagingWebSocketHandlers = {}) {
    if (this.client?.active) {
      return;
    }

    const token = getToken();

    if (!token) {
      handlers.onError?.(
        new Error("You must be logged in to connect to messaging.")
      );
      return;
    }

    const brokerURL =
      process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

    const client = new Client({
      brokerURL,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      onConnect: () => {
        this.subscribeToQueues(handlers);
        handlers.onConnected?.();
      },

      onDisconnect: () => {
        handlers.onDisconnected?.();
      },

      onWebSocketError: () => {
        handlers.onError?.(
          new Error("Messaging WebSocket connection failed.")
        );
      },

      onStompError: (frame) => {
        handlers.onError?.(
          new Error(
            frame.headers["message"] ??
              "Messaging server returned a STOMP error."
          )
        );
      },
    });

    this.client = client;
    client.activate();
  }

  disconnect() {
    if (!this.client) {
      return;
    }

    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.subscriptions = [];

    void this.client.deactivate();

    this.client = null;
  }

  sendMessage(request: ChatSendRequest) {
    this.publish("/app/chat.send", request);
  }

  sendTyping(
    conversationId: string,
    typing: boolean
  ) {
    this.publish("/app/chat.typing", {
      conversationId,
      typing,
    });
  }

  sendRead(conversationId: string) {
    this.publish("/app/chat.read", {
      conversationId,
    });
  }

  acceptRequest(conversationId: string) {
    this.publish("/app/chat.accept", {
      conversationId,
    });
  }

  private publish(destination: string, body: unknown) {
    if (!this.client?.connected) {
      throw new Error("Messaging WebSocket is not connected.");
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  private subscribeToQueues(
    handlers: MessagingWebSocketHandlers
  ) {
    if (!this.client) {
      return;
    }

    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.subscriptions = [];

    this.subscriptions.push(
      this.client.subscribe(
        "/user/queue/messages",
        (frame: IMessage) => {
          const message = JSON.parse(frame.body) as Message;
          handlers.onMessage?.(message);
        }
      )
    );

    this.subscriptions.push(
      this.client.subscribe(
        "/user/queue/typing",
        (frame: IMessage) => {
          const event = JSON.parse(
            frame.body
          ) as TypingEvent;

          handlers.onTyping?.(event);
        }
      )
    );

    this.subscriptions.push(
      this.client.subscribe(
        "/user/queue/read",
        (frame: IMessage) => {
          const event = JSON.parse(
            frame.body
          ) as ReadEvent;

          handlers.onRead?.(event);
        }
      )
    );

    this.subscriptions.push(
      this.client.subscribe(
        "/user/queue/requests",
        (frame: IMessage) => {
          const event = JSON.parse(
            frame.body
          ) as RequestEvent;

          handlers.onRequest?.(event);
        }
      )
    );
  }
}

export const messagingWebSocket =
  new MessagingWebSocket();