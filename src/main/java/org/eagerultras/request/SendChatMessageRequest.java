package org.eagerultras.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendChatMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    private String content;
}

