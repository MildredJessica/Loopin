package com.loopin.messageservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Component
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private final SecretKey key;

    public JwtStompChannelInterceptor(
            @Value("${loopin.jwt.secret}") String secret
    ) {
        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization =
                accessor.getFirstNativeHeader("Authorization");

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException(
                    "Missing STOMP Authorization header"
            );
        }

        String token = authorization.substring(7).trim();

        if (token.isEmpty()) {
            throw new IllegalArgumentException(
                    "Empty STOMP bearer token"
            );
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userIdValue = claims.get("uid", String.class);

            if (userIdValue == null || userIdValue.isBlank()) {
                throw new IllegalArgumentException(
                        "JWT does not contain uid"
                );
            }

            UUID userId;

            try {
                userId = UUID.fromString(userIdValue);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "JWT uid is not a valid UUID"
                );
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId.toString(),
                            null,
                            List.of()
                    );

            accessor.setUser(authentication);

        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid or expired WebSocket token",
                    e
            );
        }
    }
}