package org.eagerultras.service;

import org.eagerultras.response.ChatMessageResponse;
import org.eagerultras.response.ChatSummaryResponse;

import java.util.List;

public interface ChatService {

    List<ChatSummaryResponse> listChats(Long userId);

    List<ChatMessageResponse> getMessages(Long userId, String otherUsername);

    ChatMessageResponse sendMessage(Long senderUserId, String recipientUsername, String content);
}

