package org.eagerultras.response;

import lombok.Data;

import java.util.List;

@Data
public class TeamDetailResponse {

    private Long id;
    private String name;
    private CountryResponse country;
    private List<StadiumItem> stadiums;

    @Data
    public static class StadiumItem {
        private Long id;
        private String name;
        private String city;
    }
}

