package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfileResponse {

    private String username;
    private List<MatchItem> matches;
    private List<StadiumResponse> wishlist;

    @Data
    public static class MatchItem {
        private Long id;
        private StadiumResponse stadium;
        private TeamResponse homeTeam;
        private TeamResponse awayTeam;
        private LocalDateTime matchAt;
        private Short stadiumRating;
        private String comment;
    }
}

