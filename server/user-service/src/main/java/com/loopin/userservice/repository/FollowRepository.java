package com.loopin.userservice.repository;

import com.loopin.userservice.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {
    Optional<Follow> findByFollowerIdAndFolloweeId(UUID followerId, UUID followeeId);
    long countByFolloweeId(UUID followeeId);
    long countByFollowerId(UUID followerId);
    List<Follow> findByFollowerId(UUID followerId);
    boolean existsByFollowerIdAndFolloweeId(UUID followerId, UUID followeeId);
}
