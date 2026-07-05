package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostCommentResponse {

    private Long id;
    private Long authorId;
    private String authorUsername;
    private String content;
    private LocalDateTime createdAt;
}
