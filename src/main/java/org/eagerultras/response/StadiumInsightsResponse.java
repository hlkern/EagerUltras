package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class StadiumInsightsResponse {

    private Double averageRating;
    private Integer ratingCount;
    private List<CommentItem> comments;

    @Data
    public static class CommentItem {
        private Long matchId;
        private String username;
        private String comment;
        private Short rating;
        private LocalDateTime matchAt;
        private Integer likeCount;
        private Integer dislikeCount;
        private String currentUserReaction;
    }
}
