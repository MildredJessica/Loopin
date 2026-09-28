package com.loopin.postservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Fire-and-forget call to notification-service. A failure here (service down,
 * network blip) must never block the like/comment action itself — we log and
 * move on. In production, swap this for a message queue (Kafka/RabbitMQ) so
 * notifications survive a notification-service outage instead of being lost.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {
    private final RestClient notificationServiceClient;

    @Async("notificationExecutor")
    public void send(NotificationEvent event) {
        try {
            notificationServiceClient.post()
                    .uri("/internal/notifications")
                    .body(event)
                    .retrieve()
                    .toBodilessEntity();
            log.info(
                    "Notification delivered successfully: recipient={}, actor={}, type={}",
                    event.recipientUsername(),
                    event.actorUsername(),
                    event.type()
            );

        } catch (Exception e) {
            log.error(
                    "FAILED to deliver notification: recipient={}, actor={}, type={}",
                    event.recipientUsername(),
                    event.actorUsername(),
                    event.type(),
                    e
            );
        }
    }
}
