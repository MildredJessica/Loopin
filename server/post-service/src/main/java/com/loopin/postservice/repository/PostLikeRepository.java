package com.loopin.postservice.repository;

import com.loopin.postservice.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface PostLikeRepository  extends JpaRepository<PostLike, UUID> {
    Optional<PostLike> findByPostIdAndUserId(UUID postId, UUID userId);
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    @Query("""
    SELECT p.postId
    FROM PostLike p
    WHERE p.userId = :userId
      AND p.postId IN :postIds
""")
    Set<UUID> findLikedPostIds(
            @Param("userId") UUID userId,
            @Param("postIds") Collection<UUID> postIds
    );
}