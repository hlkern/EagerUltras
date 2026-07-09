package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {

    private String type;
    private String username;
    private String message;
    private String targetUrl;
    private LocalDateTime createdAt;
    private boolean unread;
}
