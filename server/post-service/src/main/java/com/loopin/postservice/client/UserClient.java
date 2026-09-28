package com.loopin.postservice.client;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collection;
import java.util.Map;
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

    public Map<UUID, String> getAvatarGradients(Collection<UUID> userIds) {

        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }

        UriComponentsBuilder builder =
                UriComponentsBuilder.fromPath("/users/avatar-gradients");

        userIds.forEach(id ->
                builder.queryParam("ids", id)
        );

        return userServiceClient
                .get()
                .uri(builder.build().toUri())
                .retrieve()
                .body(new ParameterizedTypeReference<Map<UUID, String>>() {});
    }
}