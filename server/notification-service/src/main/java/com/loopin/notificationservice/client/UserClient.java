package com.loopin.notificationservice.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserClient {
    private final RestClient userServiceClient;

    public String getAvatarGradient(UUID userId) {
        return userServiceClient
                .get()
                .uri("/users/{userId}/avatar-gradient", userId)
                .retrieve()
                .body(String.class);
    }


}
