package com.loopin.postservice.controller;

import com.loopin.postservice.dto.CommentResponse;
import com.loopin.postservice.dto.CreateCommentRequest;
import com.loopin.postservice.dto.CreatePostRequest;
import com.loopin.postservice.dto.PostResponse;
import com.loopin.postservice.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * X-User-Id, X-Username, X-Avatar-Gradient are attached by the API Gateway
 * after JWT validation. Endpoints that only read (feed, comments) accept an
 * optional viewer id; endpoints that write (post, like, comment) require it.
 */
@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping
    public ResponseEntity<Page<PostResponse>> feed(
            @RequestHeader(value = "X-User-Id", required = false) UUID viewerID,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getFeed(pageable, viewerID));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(
            @RequestHeader("X-User-Id") UUID authorId,
            @RequestHeader("X-Username") String authorUsername,
            @RequestHeader("X-Avatar-Gradient") String avatarGradient,
            @Valid @RequestBody CreatePostRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPost(authorId, authorUsername, avatarGradient, req));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostResponse> like(
            @PathVariable UUID postId,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-Username") String username,
            @RequestHeader("X-Avatar-Gradient") String avatarGradient
    ) {
        return ResponseEntity.ok(postService.like(postId, userId, username, avatarGradient));
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<PostResponse> unlike(
            @PathVariable UUID postId,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(postService.unlike(postId, userId));
    }

    @PostMapping("/{postId}/comments")
  public ResponseEntity<CommentResponse> comment(
            @PathVariable UUID postId,
            @RequestHeader("X-User-Id") UUID authorId,
            @RequestHeader("X-Username") String authorUsername,
            @RequestHeader("X-Avatar-Gradient") String avatarGradient,
            @Valid @RequestBody CreateCommentRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.addComment(postId, authorId, authorUsername, avatarGradient, req));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<Page<CommentResponse>> comments(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(postService.getComments(postId, PageRequest.of(page, size)));
    }
}
