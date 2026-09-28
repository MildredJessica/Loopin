package com.loopin.notificationservice.controller;

import com.loopin.notificationservice.dto.NotificationResponse;
import com.loopin.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * X-Username is attached by the API Gateway after JWT validation — a user
 * can only ever read their own notifications.
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> list(
            @RequestHeader("X-Username") String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(notificationService.getForUser(username, PageRequest.of(page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(username)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@RequestHeader("X-Username") String username) {
        notificationService.markAllRead(username);
        return ResponseEntity.noContent().build();
    }
}
