package com.loopin.notificationservice.service;

import com.loopin.notificationservice.client.UserClient;
import com.loopin.notificationservice.dto.NotificationEventRequest;
import com.loopin.notificationservice.dto.NotificationResponse;
import com.loopin.notificationservice.model.Notification;
import com.loopin.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserClient userClient;


    public void create(NotificationEventRequest req) {
        notificationRepository.save(Notification.builder()
                .recipientUsername(req.recipientUsername())
                .actorId(req.actorId())
                .actorUsername(req.actorUsername())
                .actorGradient(req.actorGradient())
                .type(req.type())
                .message(req.message())
                .build());
    }

//    public void create(NotificationEventRequest req) {
//
//        Notification notification = notificationRepository.save(
//                Notification.builder()
//                        .recipientUsername(req.recipientUsername())
//                        .actorUsername(req.actorUsername())
//                        .actorGradient(req.actorGradient())
//                        .type(req.type())
//                        .message(req.message())
//                        .build()
//        );
//
//        log.info(
//                "NOTIFICATION SAVED: id={}, recipient={}, actor={}, type={}",
//                notification.getId(),
//                notification.getRecipientUsername(),
//                notification.getActorUsername(),
//                notification.getType()
//        );
//    }
    public Page<NotificationResponse> getForUser(String username, Pageable pageable) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username, pageable)
                .map(n -> {
                    String currentAvatarGradient = n.getActorId() != null
                            ? userClient.getAvatarGradient(n.getActorId())
                            : n.getActorGradient();
                    return new NotificationResponse(
                            n.getId(), n.getActorId(), n.getActorUsername(), currentAvatarGradient,
                            n.getType(), n.getMessage(), n.isRead(), n.getCreatedAt()
                    );
                });
    }

    public long unreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndReadFalse(username);
    }

//    public long unreadCount(String username) {
//        long count = notificationRepository
//                .countByRecipientUsernameAndReadFalse(username);
//
//        log.info(
//                "UNREAD COUNT: username={}, count={}",
//                username,
//                count
//        );
//
//        return count;
//    }
    @Transactional
    public void markAllRead(String username) {
        notificationRepository.markAllRead(username);
    }
}
