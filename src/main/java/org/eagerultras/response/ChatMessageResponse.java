package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageResponse {

    private Long id;
    private Long senderId;
    private String senderUsername;
    private String content;
    private LocalDateTime createdAt;
}

