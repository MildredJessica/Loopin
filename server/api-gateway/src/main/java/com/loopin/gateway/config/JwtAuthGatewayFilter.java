package com.loopin.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Validates the caller's JWT exactly once, here, and forwards the identity
 * downstream as plain headers (X-User-Id, X-Username, X-Name,
 * X-Avatar-Gradient). Every other service trusts those headers instead of
 * reparsing the token — see each service's SecurityConfig / controller
 * javadoc for that assumption.
 *
 * /auth/** (register, login) and all CORS preflight (OPTIONS) requests skip
 * validation. Everything else requires a valid Bearer token.
 */
@Component
public class JwtAuthGatewayFilter implements GlobalFilter, Ordered {
    private static final List<String> PUBLIC_PREFIXES = List.of("/api/auth/", "/ws");

    private final SecretKey key;

    public JwtAuthGatewayFilter(@Value("${loopin.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public int getOrder() {
        return -1; // run before routing
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();


        if (request.getMethod() != null && request.getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }
        if (PUBLIC_PREFIXES.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing bearer token");
        }

        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(authHeader.substring(7))
                    .getPayload();

            ServerHttpRequest mutated = request.mutate()
                    .header("X-User-Id", claims.get("uid", String.class))
                    .header("X-Username", claims.getSubject())
                    .header("X-Name", claims.get("name", String.class))
                    .header("X-Avatar-Gradient", claims.get("avatarGradient", String.class))
                    .build();
            System.out.println("=== JWT FILTER: attaching X-User-Id=" + claims.get("uid", String.class));
            return chain.filter(exchange.mutate().request(mutated).build());
        } catch (JwtException e) {
            return unauthorized(exchange, "Invalid or expired token");
        }
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String reason) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("X-Auth-Error", reason);
        return exchange.getResponse().setComplete();
    }
}
