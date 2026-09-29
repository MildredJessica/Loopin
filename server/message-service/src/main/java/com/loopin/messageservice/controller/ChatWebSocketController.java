package com.loopin.messageservice.controller;

import com.loopin.messageservice.dto.*;
import com.loopin.messageservice.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(@Valid ChatSendRequest request, Principal principal) {
        UUID senderId = UUID.fromString(principal.getName());

        MessageResponse message = messageService.sendMessage(
                senderId,
                request.conversationId(),
                new SendMessageRequest(
                        request.type(),
                        request.content(),
                        request.clientMessageId()
                )
        );

        UUID recipientId = messageService.getOtherMember(
                request.conversationId(), senderId
        );

        ChatEvent event = new ChatEvent(
                "MESSAGE_CREATED",
                request.conversationId(),
                message,
                senderId,
                message.createdAt()
        );

        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/messages",
                event
        );

        // Echo the server-authoritative message back to the sender.
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/messages",
                event
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(@Valid TypingEvent request, Principal principal) {
        UUID senderId = UUID.fromString(principal.getName());

        UUID recipientId = messageService.getOtherMember(
                request.conversationId(), senderId
        );

        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/typing",
                new ChatEvent(
                        request.typing() ? "TYPING_STARTED" : "TYPING_STOPPED",
                        request.conversationId(),
                        null,
                        senderId,
                        java.time.Instant.now()
                )
        );
    }

    @MessageMapping("/chat.read")
    public void read(@Valid ReadEvent request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());

        messageService.markRead(userId, request.conversationId());

        UUID otherId = messageService.getOtherMember(
                request.conversationId(), userId
        );

        messagingTemplate.convertAndSendToUser(
                otherId.toString(),
                "/queue/read",
                new ChatEvent(
                        "MESSAGES_READ",
                        request.conversationId(),
                        null,
                        userId,
                        java.time.Instant.now()
                )
        );
    }

    @MessageMapping("/chat.accept")
    public void accept(ReadEvent request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());

        messageService.acceptRequest(userId, request.conversationId());

        UUID otherId = messageService.getOtherMember(
                request.conversationId(), userId
        );

        messagingTemplate.convertAndSendToUser(
                otherId.toString(),
                "/queue/requests",
                new ChatEvent(
                        "REQUEST_ACCEPTED",
                        request.conversationId(),
                        null,
                        userId,
                        java.time.Instant.now()
                )
        );
    }
}
