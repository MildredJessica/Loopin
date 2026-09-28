package com.loopin.postservice.service;

import com.loopin.postservice.client.NotificationClient;
import com.loopin.postservice.client.NotificationEvent;
import com.loopin.postservice.client.UserClient;
import com.loopin.postservice.dto.CommentResponse;
import com.loopin.postservice.dto.CreateCommentRequest;
import com.loopin.postservice.dto.CreatePostRequest;
import com.loopin.postservice.dto.PostResponse;
import com.loopin.postservice.model.Comment;
import com.loopin.postservice.model.Post;
import com.loopin.postservice.model.PostLike;
import com.loopin.postservice.repository.CommentRepository;
import com.loopin.postservice.repository.PostLikeRepository;
import com.loopin.postservice.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final NotificationClient notificationClient;
    private final UserClient userClient;


    /**
     * FAST FEED
     *
     * 1 query for posts
     * 1 batch query for viewer's likes
     */
    public Page<PostResponse> getFeed(Pageable pageable, UUID viewerId) {

        Page<Post> posts =
                postRepository.findAllByOrderByCreatedAtDesc(pageable);

        if (posts.isEmpty()) {
            return posts.map(post -> toResponse(post, false, post.getAuthorGradient()));
        }

        Set<UUID> likedPostIds = viewerId == null
                ? Set.of()
                : postLikeRepository.findLikedPostIds(
                viewerId,
                posts.getContent()
                        .stream()
                        .map(Post::getId)
                        .toList()
        );

        Set<UUID> authorIds = posts.getContent()
                .stream()
                .map(Post::getAuthorId)
                .collect(java.util.stream.Collectors.toSet());

        Map<UUID, String> currentGradients =
                userClient.getAvatarGradients(authorIds);

        return posts.map(post ->
                toResponse(
                        post,
                        likedPostIds.contains(post.getId()),
                        currentGradients.getOrDefault(
                                post.getAuthorId(),
                                post.getAuthorGradient()
                        )
                )
        );
    }


    /**
     * CREATE POST
     *
     * One User Service lookup is currently retained because
     * the post must use the user's current avatar gradient.
     */
    public PostResponse createPost(UUID authorId, String authorUsername, String avatarGradient, CreatePostRequest request){
        // Get the user's CURRENT avatar gradient from User Service.
//        String currentAvatarGradient = userClient.getAvatarGradient(authorId);
        Post post = Post.builder()
                .authorId(authorId)
                .authorUsername(authorUsername)
                .authorGradient(avatarGradient)
                .body(request.body())
                .tag(request.tag())
                .mediaLabel(request.mediaLabel())
                .mediaGradient(request.mediaGradient())
                .build();
        return toResponse(postRepository.save(post),false, avatarGradient);
    }

    /**
     * LIKE
     */
    @Transactional
    public PostResponse like(UUID postId, UUID userID, String actorUsername, String actorGradient){
        Post post = findPostOrThrow(postId);
        if (postLikeRepository.existsByPostIdAndUserId(postId, userID)) {
            return toResponse(post, true, actorGradient);
        }
        postLikeRepository.save(
                PostLike.builder()
                        .postId(postId)
                        .userId(userID)
                        .build()
        );
        post.setLikeCount(post.getLikeCount() + 1);

        if (!post.getAuthorId().equals(userID)){
            notificationClient.send(new NotificationEvent(
                    post.getAuthorUsername(), post.getAuthorId(), actorUsername, actorGradient,
                    "LIKE", actorUsername + " Liked your post"
            ));
        }
        return  toResponse(post, true, post.getAuthorGradient());
    }
    /**
     * UNLIKE
     */
    @Transactional
    public PostResponse unlike(UUID postID, UUID userID) {
        Post post = findPostOrThrow(postID);
        postLikeRepository.findByPostIdAndUserId(postID, userID).ifPresent(like -> {
            postLikeRepository.delete(like);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        });
        return toResponse(post, false, post.getAuthorGradient());
    }

    /**
     * ADD COMMENT
     */
    @Transactional
    public CommentResponse addComment(UUID postID, UUID authorID, String authorUsername,
                                      String avatarGradient, CreateCommentRequest req) {
        Post post = findPostOrThrow(postID);

        /*
         * Retained for now because the application requires
         * the current avatar gradient.
         */
        // Get the user's CURRENT avatar gradient from User Service.
        // String currentAvatarGradient = userClient.getAvatarGradient(authorID);
        Comment comment = Comment.builder()
                .postId(postID)
                .authorId(authorID)
                .authorUsername(authorUsername)
                .authorGradient(avatarGradient)
                .text(req.text())
                .build();
        commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);

        if (!post.getAuthorId().equals(authorID)) {
            notificationClient.send(new NotificationEvent(
                    post.getAuthorUsername(), post.getAuthorId(), authorUsername, avatarGradient,
                    "COMMENT", authorUsername + " commented: \"" + trim(req.text()) + "\""
            ));
        }

        return new CommentResponse(comment.getId(), comment.getAuthorUsername(), comment.getAuthorGradient(),
                comment.getText(), comment.getCreatedAt());
    }

    /**
     * FAST COMMENTS
     *
     * 1 database query.
     *
     * No User Service call for every comment.
     */
//    public Page<CommentResponse> getComments(UUID postId, Pageable pageable) {
//        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable)
//                .map(c ->{
//                        return new CommentResponse(c.getId(), c.getAuthorUsername(), c.getAuthorGradient(), c.getText(), c.getCreatedAt());
//                });
//    }

    public Page<CommentResponse> getComments(
            UUID postId,
            Pageable pageable
    ) {
        Page<Comment> comments =
                commentRepository.findByPostIdOrderByCreatedAtAsc(
                        postId,
                        pageable
                );

        if (comments.isEmpty()) {
            return comments.map(c ->
                    new CommentResponse(
                            c.getId(),
                            c.getAuthorUsername(),
                            c.getAuthorGradient(),
                            c.getText(),
                            c.getCreatedAt()
                    )
            );
        }

        Set<UUID> authorIds = comments.getContent()
                .stream()
                .map(Comment::getAuthorId)
                .collect(java.util.stream.Collectors.toSet());

        Map<UUID, String> currentGradients =
                userClient.getAvatarGradients(authorIds);

        return comments.map(comment ->
                new CommentResponse(
                        comment.getId(),
                        comment.getAuthorUsername(),
                        currentGradients.getOrDefault(
                                comment.getAuthorId(),
                                comment.getAuthorGradient()
                        ),
                        comment.getText(),
                        comment.getCreatedAt()
                )
        );
    }
//    private PostResponse toResponse(Post post, UUID viewerId) {
//        boolean liked = viewerId != null && postLikeRepository.existsByPostIdAndUserId(post.getId(), viewerId);
//        String currentAvatarGradient = userClient.getAvatarGradient(post.getAuthorId());
//        return new PostResponse(
//                post.getId(), post.getAuthorUsername(), currentAvatarGradient, post.getBody(), post.getTag(),
//                post.getMediaLabel(), post.getMediaGradient(), post.getLikeCount(), liked,
//                post.getCommentCount(), post.getCreatedAt()
//        );
//    }
    private PostResponse toResponse(Post post, boolean liked, String avatarGradient) {
        return new PostResponse(
                post.getId(),
                post.getAuthorUsername(),
                avatarGradient,
                post.getBody(),
                post.getTag(),
                post.getMediaLabel(),
                post.getMediaGradient(),
                post.getLikeCount(),
                liked,
                post.getCommentCount(),
                post.getCreatedAt()
        );
    }
    private Post findPostOrThrow(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private String trim(String text) {
        return text.length() > 60 ? text.substring(0, 60) + "…" : text;
    }
}
