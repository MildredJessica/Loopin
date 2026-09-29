package com.loopin.messageservice.client;

import com.loopin.messageservice.dto.UserMessagingProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${loopin.user-service.base-url:http://localhost:8081}")
    private String baseUrl;

    @Value("${loopin.internal-api-key:${LOOPIN_INTERNAL_API_KEY:${LOOPIN_JWT_SECRET:}}}")
    private String internalApiKey;

    public UserMessagingProfile getMessagingProfile(String username, UUID viewerId) {
        try {
            return restClientBuilder.build()
                    .get()
                    .uri(baseUrl + "/internal/users/{username}/messaging-profile?viewerId={viewerId}",
                            username, viewerId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(UserMessagingProfile.class);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to contact user service"
            );
        }
    }
}
