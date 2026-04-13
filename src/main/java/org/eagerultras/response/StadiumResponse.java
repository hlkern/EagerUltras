package org.eagerultras.response;

import lombok.Data;

import java.util.List;

@Data
public class StadiumResponse {
    private Long id;
    private String name;
    private String city;
    private Integer capacity;
    private Double latitude;
    private Double longitude;
    private List<TeamResponse> teams;
    private CountryResponse country;

}
