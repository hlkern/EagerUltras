package org.eagerultras.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateUserMatchRequest {

    @NotNull
    private Long stadiumId;

    @NotNull
    private Long homeTeamId;

    @NotNull
    private Long awayTeamId;

    @NotNull
    private LocalDateTime matchAt;

    @Min(1)
    @Max(10)
    private Short stadiumRating;

    private String comment;
}
