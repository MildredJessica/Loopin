package com.loopin.postservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class GatewayIdentityFilter extends OncePerRequestFilter {
    private final SecretKey key;
    public GatewayIdentityFilter(@Value("${loopin.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        return HttpMethod.OPTIONS.matches(request.getMethod());
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing bearer token"); return;
        }
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(authorization.substring(7)).getPayload();
            String userId = claims.get("uid", String.class), username = claims.getSubject();
            if (userId == null || username == null) throw new JwtException("Missing identity claims");
            chain.doFilter(new IdentityRequestWrapper(request, userId, username,
                    claims.get("avatarGradient", String.class)), response);
        } catch (JwtException | IllegalArgumentException exception) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
        }
    }
    private static final class IdentityRequestWrapper extends HttpServletRequestWrapper {
        private final String userId, username, gradient;
        private IdentityRequestWrapper(HttpServletRequest request, String userId, String username, String gradient) {
            super(request); this.userId = userId; this.username = username; this.gradient = gradient;
        }
        @Override public String getHeader(String name) {
            return switch (name) {
                case "X-User-Id" -> userId;
                case "X-Username" -> username;
                case "X-Avatar-Gradient" -> gradient;
                default -> super.getHeader(name);
            };
        }
    }
}
