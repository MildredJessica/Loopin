package com.loopin.userservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Validates the bearer token even when this service is reached without the gateway. */
@Component
@RequiredArgsConstructor
public class GatewayIdentityFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    @Value("${loopin.internal-api-key}")
    private String internalApiKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/auth/") || HttpMethod.OPTIONS.matches(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Allow trusted service-to-service requests
        String providedInternalKey = request.getHeader("X-Internal-Api-Key");

        if (internalApiKey.equals(providedInternalKey)) {
            chain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing bearer token");
            return;
        }
        try {
            Claims claims = jwtService.parse(authorization.substring(7));
            String userId = claims.get("uid", String.class);
            String username = claims.getSubject();
            String name = claims.get("name", String.class);
            String gradient = claims.get("avatarGradient", String.class);
            if (userId == null || username == null) throw new JwtException("Missing identity claims");
            chain.doFilter(new IdentityRequestWrapper(request, userId, username, name, gradient), response);
        } catch (JwtException | IllegalArgumentException exception) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
        }
    }

    private static final class IdentityRequestWrapper extends HttpServletRequestWrapper {
        private final String userId, username, name, gradient;
        private IdentityRequestWrapper(HttpServletRequest request, String userId, String username, String name, String gradient) {
            super(request); this.userId = userId; this.username = username; this.name = name; this.gradient = gradient;
        }
        @Override public String getHeader(String header) {
            return switch (header) {
                case "X-User-Id" -> userId;
                case "X-Username" -> username;
                case "X-Name" -> name;
                case "X-Avatar-Gradient" -> gradient;
                default -> super.getHeader(header);
            };
        }
    }
}
