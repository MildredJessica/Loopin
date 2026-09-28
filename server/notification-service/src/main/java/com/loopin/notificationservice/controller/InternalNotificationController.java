package com.loopin.notificationservice.controller;

import com.loopin.notificationservice.dto.NotificationEventRequest;
import com.loopin.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Called service-to-service (post-service, user-service) — never routed
 * through the public API Gateway. In production, restrict this at the
 * network layer (private subnet / service mesh) rather than relying on
 * "nobody knows the URL".
 */
@RestController
@RequestMapping("/internal/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {
    private final NotificationService notificationService;
    @Value("${loopin.internal-api-key}")
    private String internalApiKey;

    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestHeader("X-Internal-Api-Key") String suppliedKey,
            @Valid @RequestBody NotificationEventRequest req) {
        if (!internalApiKey.equals(suppliedKey)) {
            return ResponseEntity.status(403).build();
        }
        notificationService.create(req);
        return ResponseEntity.accepted().build();
    }
}
