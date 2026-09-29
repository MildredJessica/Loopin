package com.loopin.messageservice.controller;

import com.loopin.messageservice.dto.*;
import com.loopin.messageservice.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversations")
    public List<ConversationResponse> conversations(
            @RequestHeader("X-User-Id") UUID userId) {
        return messageService.listConversations(userId);
    }

    @PostMapping("/conversations")
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse createConversation(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateConversationRequest request) {
        return messageService.createConversation(userId, request.username());
    }

    @GetMapping("/conversations/{conversationId}")
    public Page<MessageResponse> history(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return messageService.history(userId, conversationId, page, size);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public MessageResponse send(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        return messageService.sendMessage(userId, conversationId, request);
    }

    @PostMapping("/conversations/{conversationId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accept(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID conversationId) {
        messageService.acceptRequest(userId, conversationId);
    }

    @PostMapping("/conversations/{conversationId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID conversationId) {
        messageService.rejectRequest(userId, conversationId);
    }

    @PutMapping("/conversations/{conversationId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void read(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID conversationId) {
        messageService.markRead(userId, conversationId);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unread(
            @RequestHeader("X-User-Id") UUID userId) {
        return messageService.unreadCount(userId);
    }
}
