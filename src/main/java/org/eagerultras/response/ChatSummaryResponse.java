package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatSummaryResponse {

    private Long otherUserId;
    private String otherUsername;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
}

