package org.eagerultras.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DashboardHighlightsResponse {

    private StadiumResponse latestVisitedStadium;
    private LocalDateTime latestVisitedMatchAt;
    private StadiumResponse latestWishlistStadium;
}

