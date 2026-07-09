package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FollowedMatchFeedResponse {

    private Long id;
    private Long userId;
    private String username;
    private StadiumResponse stadium;
    private TeamResponse homeTeam;
    private TeamResponse awayTeam;
    private LocalDateTime matchAt;
    private Short stadiumRating;
    private String comment;
    private LocalDateTime createdAt;
}
