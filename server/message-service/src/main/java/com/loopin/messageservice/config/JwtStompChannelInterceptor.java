package com.loopin.messageservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Collections;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private final SecretKey key;

    public JwtStompChannelInterceptor(
            @Value("${loopin.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (command == StompCommand.CONNECT) {
            authenticate(accessor);
        }

        if (command == StompCommand.SUBSCRIBE) {
            Principal principal = accessor.getUser();

            if (principal == null) {
                throw new IllegalArgumentException("WebSocket authentication required");
            }

            String destination = accessor.getDestination();

            if (destination == null ||
                    !destination.startsWith("/user/queue/")) {
                throw new IllegalArgumentException("Subscription not allowed");
            }
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing WebSocket bearer token");
        }

        String token = authorization.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.get("uid", String.class);

            if (userId == null) {
                throw new IllegalArgumentException("Token has no user id");
            }

            UUID.fromString(userId);

            accessor.setUser(
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.emptyList()
                    )
            );
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid or expired WebSocket token", e);
        }
    }
}
