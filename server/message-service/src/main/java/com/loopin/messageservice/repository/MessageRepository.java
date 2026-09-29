package com.loopin.messageservice.repository;

import com.loopin.messageservice.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);
    Optional<Message> findByConversationIdAndClientMessageId(UUID conversationId, UUID clientMessageId);
    long countByConversationId(UUID conversationId);
    Optional<Message> findTopByConversationIdOrderByCreatedAtDesc(UUID conversationId);
}
