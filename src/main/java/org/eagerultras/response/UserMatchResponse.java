package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserMatchResponse {

    private Long id;
    private StadiumResponse stadium;
    private TeamResponse homeTeam;
    private TeamResponse awayTeam;
    private LocalDateTime matchAt;
    private Short stadiumRating;
    private String comment;
    private LocalDateTime createdAt;
}
