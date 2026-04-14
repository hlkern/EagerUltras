package org.eagerultras.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateUserMatchRequest {

    @Min(1)
    @Max(10)
    private Short stadiumRating;

    private String comment;
}
