package org.eagerultras.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.eagerultras.entity.ReactionType;

@Data
public class SetUserMatchReactionRequest {

    @NotNull
    private ReactionType reaction;
}

