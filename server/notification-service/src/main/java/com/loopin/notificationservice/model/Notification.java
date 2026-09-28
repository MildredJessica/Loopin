package com.loopin.notificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30)
    private String recipientUsername;

    @Column(nullable = false)
    private UUID actorId;

    @Column(nullable = false, length = 30)
    private String actorUsername;

    @Column(nullable = false, length = 60)
    private String actorGradient;

    @Column(nullable = false, length = 20)
    private String type; // LIKE | COMMENT | FOLLOW | STICKER

    @Column(nullable = false, length = 280)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
