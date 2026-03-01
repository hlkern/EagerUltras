package org.eagerultras.response;

import lombok.Data;

@Data
public class StadiumResponse {
    private Long id;
    private String name;
    private String city;
    private Integer capacity;
    private Double latitude;
    private Double longitude;
    private CountryResponse country;

}
