package com.loopin.messageservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversation_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMember {

    @EmbeddedId
    private ConversationMemberId id;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "last_read_at")
    private Instant lastReadAt;

    @PrePersist
    void onCreate() {
        if (joinedAt == null) joinedAt = Instant.now();
    }
}
