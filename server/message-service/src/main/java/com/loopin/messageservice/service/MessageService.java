package com.loopin.messageservice.service;

import com.loopin.messageservice.client.UserServiceClient;
import com.loopin.messageservice.dto.*;
import com.loopin.messageservice.model.*;
import com.loopin.messageservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public ConversationResponse createConversation(UUID currentUserId, String username) {
        UserMessagingProfile target = userServiceClient.getMessagingProfile(username, currentUserId);

        if (target.id().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        }

        String directKey = directKey(currentUserId, target.id());

        Conversation conversation = conversationRepository.findByDirectKey(directKey).orElse(null);

        if (conversation == null) {
            boolean request = !target.followsTarget();

            conversation = Conversation.builder()
                    .directKey(directKey)
                    .status(request ? ConversationStatus.REQUEST : ConversationStatus.ACCEPTED)
                    .requestedBy(request ? currentUserId : null)
                    .build();

            conversation = conversationRepository.save(conversation);

            memberRepository.save(ConversationMember.builder()
                    .id(new ConversationMemberId(conversation.getId(), currentUserId))
                    .build());

            memberRepository.save(ConversationMember.builder()
                    .id(new ConversationMemberId(conversation.getId(), target.id()))
                    .build());
        }

        return toConversationResponse(conversation, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> listConversations(UUID currentUserId) {
        return memberRepository.findByIdUserId(currentUserId).stream()
                .map(member -> conversationRepository.findById(member.getId().getConversationId()).orElse(null))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(Conversation::getUpdatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> toConversationResponse(c, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> history(UUID currentUserId, UUID conversationId, int page, int size) {
        requireMember(currentUserId, conversationId);

        int safeSize = Math.min(Math.max(size, 1), 100);

        return messageRepository
                .findByConversationIdOrderByCreatedAtDesc(
                        conversationId,
                        PageRequest.of(Math.max(page, 0), safeSize)
                )
                .map(this::toResponse);
    }

    @Transactional
    public MessageResponse sendMessage(UUID currentUserId, UUID conversationId, SendMessageRequest request) {
        Conversation conversation = requireMember(currentUserId, conversationId);

        if (conversation.getStatus() == ConversationStatus.REJECTED ||
                conversation.getStatus() == ConversationStatus.BLOCKED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This conversation is not active");
        }

        if (conversation.getStatus() == ConversationStatus.REQUEST &&
                conversation.getRequestedBy() != null &&
                !conversation.getRequestedBy().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accept the message request before replying");
        }

        if (request.type() != MessageType.TEXT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only text messages are supported in Phase 2"
            );
        }

        if (request.content() == null || request.content().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message text cannot be empty");
        }

        if (request.clientMessageId() != null) {
            Optional<Message> existing =
                    messageRepository.findByConversationIdAndClientMessageId(
                            conversationId, request.clientMessageId());

            if (existing.isPresent()) {
                return toResponse(existing.get());
            }
        }

        Message message = messageRepository.save(Message.builder()
                .conversationId(conversationId)
                .senderId(currentUserId)
                .messageType(MessageType.TEXT)
                .content(request.content().trim())
                .clientMessageId(request.clientMessageId())
                .build());

        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return toResponse(message);
    }

    @Transactional
    public void acceptRequest(UUID currentUserId, UUID conversationId) {
        Conversation conversation = requireMember(currentUserId, conversationId);

        if (conversation.getStatus() != ConversationStatus.REQUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This is not a message request");
        }

        if (Objects.equals(conversation.getRequestedBy(), currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The sender cannot accept their own request");
        }

        conversation.setStatus(ConversationStatus.ACCEPTED);
        conversation.setRequestedBy(null);
        conversationRepository.save(conversation);
    }

    @Transactional
    public void rejectRequest(UUID currentUserId, UUID conversationId) {
        Conversation conversation = requireMember(currentUserId, conversationId);

        if (conversation.getStatus() != ConversationStatus.REQUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This is not a message request");
        }

        if (Objects.equals(conversation.getRequestedBy(), currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The sender cannot reject their own request");
        }

        conversation.setStatus(ConversationStatus.REJECTED);
        conversationRepository.save(conversation);
    }

    @Transactional
    public void markRead(UUID currentUserId, UUID conversationId) {
        ConversationMember member = memberRepository.findById(
                new ConversationMemberId(conversationId, currentUserId)
        ).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a conversation member"));

        member.setLastReadAt(Instant.now());
        memberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(UUID currentUserId) {
        long count = memberRepository.findByIdUserId(currentUserId).stream()
                .map(member -> {
                    Instant lastRead = member.getLastReadAt();
                    if (lastRead == null) {
                        return messageRepository.countByConversationId(member.getId().getConversationId());
                    }
                    return messageRepository.findByConversationIdOrderByCreatedAtDesc(
                                    member.getId().getConversationId(), PageRequest.of(0, 100))
                            .stream()
                            .filter(m -> m.getCreatedAt().isAfter(lastRead))
                            .filter(m -> !m.getSenderId().equals(currentUserId))
                            .count();
                })
                .mapToLong(Long::longValue)
                .sum();

        return new UnreadCountResponse(count);
    }

    private Conversation requireMember(UUID userId, UUID conversationId) {
        if (!memberRepository.existsByIdConversationIdAndIdUserId(conversationId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this conversation");
        }

        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
    }

    private ConversationResponse toConversationResponse(Conversation conversation, UUID currentUserId) {
        List<ConversationMember> members =
                memberRepository.findByIdConversationId(conversation.getId());

        UUID otherId = members.stream()
                .map(m -> m.getId().getUserId())
                .filter(id -> !id.equals(currentUserId))
                .findFirst()
                .orElse(null);

        String username = null;
        String name = null;
        String avatar = null;

        if (otherId != null) {
            // The other user's profile is resolved lazily by the frontend/profile endpoint in Phase 2.
            // The IDs and conversation state are authoritative here.
            username = otherId.toString();
        }

        Optional<Message> last = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId());

        long unread = 0;
        ConversationMember currentMember = members.stream()
                .filter(m -> m.getId().getUserId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        if (currentMember != null) {
            Instant readAt = currentMember.getLastReadAt();
            if (readAt == null) {
                unread = last.map(m -> m.getSenderId().equals(currentUserId) ? 0L :
                        messageRepository.countByConversationId(conversation.getId())).orElse(0L);
            } else {
                unread = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                                conversation.getId(), PageRequest.of(0, 100))
                        .stream()
                        .filter(m -> m.getCreatedAt().isAfter(readAt))
                        .filter(m -> !m.getSenderId().equals(currentUserId))
                        .count();
            }
        }

        return new ConversationResponse(
                conversation.getId(),
                otherId,
                username,
                name,
                avatar,
                conversation.getStatus(),
                conversation.getRequestedBy(),
                last.map(Message::getContent).orElse(null),
                last.map(m -> m.getMessageType().name()).orElse(null),
                last.map(Message::getCreatedAt).orElse(null),
                unread
        );
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getMessageType(),
                message.getContent(),
                message.getClientMessageId(),
                message.getCreatedAt()
        );
    }

    private String directKey(UUID a, UUID b) {
        String first = a.toString();
        String second = b.toString();
        return first.compareTo(second) < 0 ? first + ":" + second : second + ":" + first;
    }

    public UUID getOtherMember(UUID conversationId, UUID currentUserId) {
        return memberRepository.findByIdConversationId(conversationId).stream()
                .map(m -> m.getId().getUserId())
                .filter(id -> !id.equals(currentUserId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Conversation recipient not found"
                ));
    }
}
