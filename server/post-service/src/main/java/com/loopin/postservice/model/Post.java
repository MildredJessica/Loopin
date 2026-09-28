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
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID authorId;

    // Denormalized display fields — avoids a network call to user-service
    // on every feed render. Kept in sync via the client calls in PostService
    // when a post is created; acceptable staleness for a display name/avatar.
    @Column(nullable = false, length = 30)
    private String authorUsername;

    @Column(nullable = false, length = 60)
    private String authorGradient;

    @Column(nullable = false, length = 2000)
    private String body;

    @Column(length = 60)
    private String tag;

    @Column(length = 120)
    private String mediaLabel;

    @Column(length = 60)
    private String mediaGradient;

    @Column(nullable = false)
    @Builder.Default
    private long likeCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private long commentCount = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

}
