package com.loopin.messageservice.repository;

import com.loopin.messageservice.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    Optional<Conversation> findByDirectKey(String directKey);
}
