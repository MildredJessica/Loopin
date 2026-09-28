package com.loopin.postservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {
    @Bean
    public RestClient notificationServiceClient(
            @Value("${loopin.notification-service.base-url}") String baseUrl,
            @Value("${loopin.internal-api-key}") String internalApiKey
    ) {
        return RestClient.builder().baseUrl(baseUrl)
                .defaultHeader("X-Internal-Api-Key", internalApiKey)
                .build();
    }

    @Bean
    public RestClient userServiceClient(
            @Value("${loopin.user-service.base-url}") String baseUrl,
            @Value("${loopin.internal-api-key}") String internalApiKey
    ) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Internal-Api-Key", internalApiKey)
                .build();
    }
}
