package org.eagerultras.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.eagerultras.request.SendChatMessageRequest;
import org.eagerultras.response.ChatMessageResponse;
import org.eagerultras.response.ChatSummaryResponse;
import org.eagerultras.service.ChatServiceImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatServiceImpl chatService;

    @GetMapping("/{userId}")
    public List<ChatSummaryResponse> listChats(@PathVariable Long userId) {
        return chatService.listChats(userId);
    }

    @GetMapping("/{userId}/with/{otherUsername}")
    public List<ChatMessageResponse> getMessages(@PathVariable Long userId, @PathVariable String otherUsername) {
        return chatService.getMessages(userId, otherUsername);
    }

    @PostMapping("/{senderUserId}/with/{recipientUsername}")
    public ChatMessageResponse sendMessage(@PathVariable Long senderUserId,
                                           @PathVariable String recipientUsername,
                                           @Valid @RequestBody SendChatMessageRequest request) {
        return chatService.sendMessage(senderUserId, recipientUsername, request.getContent());
    }
}
