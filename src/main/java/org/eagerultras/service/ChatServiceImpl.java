package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserConversation;
import org.eagerultras.entity.UserMessage;
import org.eagerultras.repository.UserConversationRepository;
import org.eagerultras.repository.UserMessageRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.response.ChatMessageResponse;
import org.eagerultras.response.ChatSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final UserRepository userRepository;
    private final UserConversationRepository userConversationRepository;
    private final UserMessageRepository userMessageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChatSummaryResponse> listChats(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanici bulunamadi"));

        return userConversationRepository.findByUserAIdOrUserBIdOrderByUpdatedAtDesc(currentUser.getId(), currentUser.getId())
                .stream()
                .map(conversation -> toSummary(currentUser, conversation))
                .toList();
    }

    @Override
    @Transactional
    public List<ChatMessageResponse> getMessages(Long userId, String otherUsername) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanici bulunamadi"));

        User otherUser = userRepository.findByUsername(otherUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hedef kullanici bulunamadi"));

        validateNotSelf(currentUser.getId(), otherUser.getId());

        Long userAId = Math.min(currentUser.getId(), otherUser.getId());
        Long userBId = Math.max(currentUser.getId(), otherUser.getId());

        UserConversation conversation = userConversationRepository.findByUserAIdAndUserBId(userAId, userBId)
                .orElse(null);

        if (conversation == null) {
            return List.of();
        }

        userMessageRepository.markConversationAsRead(conversation.getId(), currentUser.getId(), LocalDateTime.now());

        return userMessageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(Long senderUserId, String recipientUsername, String content) {
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mesaj bos olamaz");
        }

        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gonderen kullanici bulunamadi"));

        User recipient = userRepository.findByUsername(recipientUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hedef kullanici bulunamadi"));

        validateNotSelf(sender.getId(), recipient.getId());

        Long userAId = Math.min(sender.getId(), recipient.getId());
        Long userBId = Math.max(sender.getId(), recipient.getId());

        UserConversation conversation = userConversationRepository.findByUserAIdAndUserBId(userAId, userBId)
                .orElseGet(() -> createConversation(sender, recipient));

        conversation.setUpdatedAt(java.time.LocalDateTime.now());
        userConversationRepository.save(conversation);

        UserMessage message = new UserMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(normalizedContent);

        UserMessage saved = userMessageRepository.save(message);
        return toMessageResponse(saved);
    }

    private UserConversation createConversation(User left, User right) {
        User userA = left.getId() <= right.getId() ? left : right;
        User userB = left.getId() <= right.getId() ? right : left;

        UserConversation conversation = new UserConversation();
        conversation.setUserA(userA);
        conversation.setUserB(userB);
        return userConversationRepository.save(conversation);
    }

    private ChatSummaryResponse toSummary(User currentUser, UserConversation conversation) {
        User otherUser = conversation.getUserA().getId().equals(currentUser.getId())
                ? conversation.getUserB()
                : conversation.getUserA();

        UserMessage lastMessage = userMessageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId())
                .orElse(null);

        long unreadCount = userMessageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(
                conversation.getId(), currentUser.getId());

        ChatSummaryResponse response = new ChatSummaryResponse();
        response.setOtherUserId(otherUser.getId());
        response.setOtherUsername(otherUser.getUsername());
        response.setLastMessage(lastMessage != null ? lastMessage.getContent() : "Mesaj yok");
        response.setLastMessageAt(lastMessage != null ? lastMessage.getCreatedAt() : conversation.getCreatedAt());
        response.setUnreadCount((int) Math.min(unreadCount, Integer.MAX_VALUE));
        return response;
    }

    private ChatMessageResponse toMessageResponse(UserMessage message) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderUsername(message.getSender().getUsername());
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }

    private void validateNotSelf(Long userId, Long otherUserId) {
        if (userId.equals(otherUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kendine mesaj atamazsin");
        }
    }
}

