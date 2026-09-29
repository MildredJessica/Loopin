package com.loopin.userservice.controller;

import com.loopin.userservice.dto.MessagingProfileResponse;
import com.loopin.userservice.model.User;
import com.loopin.userservice.repository.FollowRepository;
import com.loopin.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @Value("${loopin.internal-api-key:${LOOPIN_INTERNAL_API_KEY:${LOOPIN_JWT_SECRET:}}}")
    private String internalApiKey;

    @GetMapping("/{username}/messaging-profile")
    public MessagingProfileResponse messagingProfile(
            @PathVariable String username,
            @RequestParam UUID viewerId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String suppliedKey) {

        if (internalApiKey == null || internalApiKey.isBlank() ||
                suppliedKey == null || !internalApiKey.equals(suppliedKey)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized internal request");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + username));

        return new MessagingProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getAvatarGradient(),
                followRepository.existsByFollowerIdAndFolloweeId(viewerId, user.getId())
        );
    }
}
