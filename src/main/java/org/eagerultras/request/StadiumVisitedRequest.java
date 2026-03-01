package org.eagerultras.request;

import lombok.Data;

@Data
public class StadiumVisitedRequest {
    private Long userId;
    private Long stadiumId;
}