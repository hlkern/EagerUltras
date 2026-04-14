package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TeamInsightsResponse {

    private Double averageRating;
    private Integer ratingCount;
    private List<CommentItem> comments;

    @Data
    public static class CommentItem {
        private String username;
        private String comment;
        private Short rating;
        private LocalDateTime matchAt;
        private String stadiumName;
        private String opponentName;
    }
}

