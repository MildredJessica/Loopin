package com.loopin.messageservice.repository;

import com.loopin.messageservice.model.ConversationMember;
import com.loopin.messageservice.model.ConversationMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {
    List<ConversationMember> findByIdUserId(UUID userId);
    boolean existsByIdConversationIdAndIdUserId(UUID conversationId, UUID userId);
    List<ConversationMember> findByIdConversationId(UUID conversationId);
}
