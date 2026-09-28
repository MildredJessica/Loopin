package com.loopin.userservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {

    private final RestClient notificationServiceClient;

    public void send(NotificationEvent event){
        try{
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
