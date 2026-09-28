package com.loopin.postservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID postId;

    @Column(nullable = false)
    private UUID authorId;

    @Column(nullable = false, length = 30)
    private String authorUsername;

    @Column(nullable = false, length = 60)
    private String authorGradient;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt= Instant.now();
}
