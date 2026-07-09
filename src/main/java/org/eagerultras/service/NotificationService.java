package org.eagerultras.service;

import org.eagerultras.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> listNotifications(Long userId, boolean unreadOnly);

    void markAllAsSeen(Long userId);
}
