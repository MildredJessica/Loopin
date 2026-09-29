package com.loopin.messageservice.controller;

import com.loopin.messageservice.dto.*;
import com.loopin.messageservice.model.ConversationStatus;
import com.loopin.messageservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(
            @Payload ChatSendRequest request,
            Principal principal
    ) {
        UUID currentUserId = currentUserId(principal);

        MessageResponse saved = messageService.sendMessage(
                currentUserId,
                request.conversationId(),
                new SendMessageRequest(
                        request.type(),
                        request.content(),
                        request.clientMessageId()
                )
        );

        ChatEvent event = new ChatEvent(
                saved.id(),
                saved.conversationId(),
                saved.senderId(),
                saved.type(),
                saved.content(),
                saved.clientMessageId(),
                saved.createdAt()
        );

        UUID otherUserId = messageService.getOtherMember(
                request.conversationId(),
                currentUserId
        );

        sendToUser(
                currentUserId,
                "/queue/messages",
                event
        );

        sendToUser(
                otherUserId,
                "/queue/messages",
                event
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(
            @Payload TypingRequest request,
            Principal principal
    ) {
        UUID currentUserId = currentUserId(principal);

        UUID otherUserId = messageService.getOtherMember(
                request.conversationId(),
                currentUserId
        );

        TypingEvent event = new TypingEvent(
                request.conversationId(),
                currentUserId,
                request.typing()
        );

        sendToUser(
                otherUserId,
                "/queue/typing",
                event
        );
    }

    @MessageMapping("/chat.read")
    public void read(
            @Payload ReadRequest request,
            Principal principal
    ) {
        UUID currentUserId = currentUserId(principal);

        messageService.markRead(
                currentUserId,
                request.conversationId()
        );

        UUID otherUserId = messageService.getOtherMember(
                request.conversationId(),
                currentUserId
        );

        ReadEvent event = new ReadEvent(
                request.conversationId(),
                currentUserId,
                Instant.now()
        );

        sendToUser(
                otherUserId,
                "/queue/read",
                event
        );
    }

    @MessageMapping("/chat.accept")
    public void accept(
            @Payload ConversationActionRequest request,
            Principal principal
    ) {
        UUID currentUserId = currentUserId(principal);

        UUID requesterId = messageService.getOtherMember(
                request.conversationId(),
                currentUserId
        );

        messageService.acceptRequest(
                currentUserId,
                request.conversationId()
        );

        RequestEvent event = new RequestEvent(
                request.conversationId(),
                currentUserId,
                ConversationStatus.ACCEPTED
        );

        sendToUser(
                requesterId,
                "/queue/requests",
                event
        );
    }

    private UUID currentUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalStateException(
                    "Authenticated WebSocket principal is missing"
            );
        }

        return UUID.fromString(principal.getName());
    }

    private void sendToUser(
            UUID userId,
            String destination,
            Object payload
    ) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                destination,
                payload
        );
    }
}