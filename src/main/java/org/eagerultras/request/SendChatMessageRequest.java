package org.eagerultras.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendChatMessageRequest {

    @NotBlank(message = "Mesaj bos olamaz")
    private String content;
}

