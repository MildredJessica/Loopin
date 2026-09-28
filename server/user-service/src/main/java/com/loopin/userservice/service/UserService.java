package com.loopin.userservice.service;

import com.loopin.userservice.client.NotificationClient;
import com.loopin.userservice.client.NotificationEvent;
import com.loopin.userservice.dto.SuggestionResponse;
import com.loopin.userservice.dto.UpdateProfileRequest;
import com.loopin.userservice.dto.UserProfileResponse;
import com.loopin.userservice.model.Follow;
import com.loopin.userservice.model.GradeLabel;
import com.loopin.userservice.model.User;
import com.loopin.userservice.repository.FollowRepository;
import com.loopin.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final NotificationClient notificationClient;


    public UserProfileResponse getProfile(String username, UUID viewerID){
        User user = findByUsernameOrThrow(username);
        long followers = followRepository.countByFolloweeId(user.getId());
        long following = followRepository.countByFollowerId(user.getId());
        boolean followedByViewer = viewerID != null && followRepository.existsByFollowerIdAndFolloweeId(viewerID, user.getId());
        return new UserProfileResponse(
                user.getUsername(), user.getName(), user.getBio(), user.getAvatarGradient(),
                user.getGradeLabel() != null ? user.getGradeLabel().toString() : null, followers, following, followedByViewer
        );
    }

    public UserProfileResponse updateProfile(UUID requesterId, String username, UpdateProfileRequest request){
        User user = findByUsernameOrThrow(username);
        if (!user.getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own profile");
        }
        if (request.name() != null) user.setName(request.name());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.avatarGradient() != null) user.setAvatarGradient(request.avatarGradient());
        
        if (request.gradeLabel() != null) {
            if (request.gradeLabel().trim().isEmpty()) {
                user.setGradeLabel(null);
            } else {
                try {
                    user.setGradeLabel(GradeLabel.valueOf(request.gradeLabel().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid grade label");
                }
            }
        }
        
        if (request.updatedAt() != null) {
            user.setUpdatedAt(request.updatedAt().atZone(ZoneId.systemDefault()).toInstant());
        } else {
            user.setUpdatedAt(Instant.now());
        }
        
        userRepository.save(user);
        return getProfile(username, user.getId());
    }

    public void follow(UUID followerId, String targetUsername){
        User target = findByUsernameOrThrow(targetUsername);
        if (target.getId().equals(followerId)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot follow yourself");
        }
        if (!followRepository.existsByFollowerIdAndFolloweeId(followerId, target.getId())){
            followRepository.save(Follow.builder().followerId(followerId).followeeId(target.getId()).build());
            User follower = userRepository.findById(followerId).orElse(null);
            if (follower != null){
                notificationClient.send(new NotificationEvent(
                        target.getUsername(), follower.getId(), follower.getUsername(), follower.getAvatarGradient(),
                        "FOLLOW", follower.getUsername()+ " started following you"
                ));
            }
        }
    }

    public void unfollow(UUID followerID, String targetUserName){
        User target = findByUsernameOrThrow(targetUserName);
        followRepository.findByFollowerIdAndFolloweeId(followerID, target.getId())
                .ifPresent(followRepository::delete);
    }

    public List<SuggestionResponse> suggestions(UUID viewerID){
        return userRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .filter(u -> viewerID == null || !u.getId().equals(viewerID))
                .map(u -> new SuggestionResponse(
                        u.getUsername(), u.getName(), u.getAvatarGradient(),
                        viewerID != null && followRepository.existsByFollowerIdAndFolloweeId(viewerID, u.getId())
                ))
                .collect(Collectors.toList());
    }

    public String getAvatarGradient(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found: " + userId
                        )
                );

        return user.getAvatarGradient();
    }

    public User findByUsernameOrThrow(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
    }

    public Map<UUID, String> getAvatarGradients(List<UUID> userIds) {
        return userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(
                        User::getId,
                        User::getAvatarGradient
                ));
    }
}
