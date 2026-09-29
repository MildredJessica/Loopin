package com.loopin.messageservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "conversations",
        uniqueConstraints = @UniqueConstraint(name = "uk_conversations_direct_key", columnNames = "direct_key")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "direct_key", nullable = false, length = 80)
    private String directKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConversationStatus status;

    @Column(name = "requested_by")
    private UUID requestedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = ConversationStatus.ACCEPTED;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
