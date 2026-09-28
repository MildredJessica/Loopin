package com.loopin.postservice.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import com.loopin.postservice.model.Story;
import com.loopin.postservice.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryRepository storyRepository;

    @GetMapping
    public ResponseEntity<Page<Story>> getStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(storyRepository.findByCreatedAtAfterOrderByCreatedAtDesc(Instant.now().minus(24, ChronoUnit.HOURS),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ));
    }

    @PostMapping
    public ResponseEntity<Story> createStory(
            @RequestHeader("X-User-Id") UUID authorId,
            @RequestHeader("X-Username") String authorUsername,
            @RequestHeader("X-Avatar-Gradient") String authorGradient,
            @RequestBody Story story) {
        story.setId(null);
        story.setAuthorId(authorId);
        story.setAuthorUsername(authorUsername);
        story.setAuthorGradient(authorGradient);
        story.setCreatedAt(Instant.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(storyRepository.save(story));
    }
}
