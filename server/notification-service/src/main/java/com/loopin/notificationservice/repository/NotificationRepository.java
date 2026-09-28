package com.loopin.notificationservice.repository;

import com.loopin.notificationservice.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername, Pageable pageable);
    long countByRecipientUsernameAndReadFalse(String recipientUsername);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipientUsername = :username AND n.read = false")
    void markAllRead(@Param("username") String username);
}
