package com.loopin.postservice.repository;

import com.loopin.postservice.model.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.time.Instant;

public interface StoryRepository extends JpaRepository<Story, UUID> {
    Page<Story> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Story> findByCreatedAtAfterOrderByCreatedAtDesc(Instant cutoff, Pageable pageable);
}
