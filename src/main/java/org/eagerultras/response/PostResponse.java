package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostResponse {

    private Long id;
    private Long authorId;
    private String authorUsername;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser;
}
