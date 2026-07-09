package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.PostComment;
import org.eagerultras.entity.PostLike;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserFollow;
import org.eagerultras.repository.PostCommentRepository;
import org.eagerultras.repository.PostLikeRepository;
import org.eagerultras.repository.UserFollowRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.response.NotificationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> listNotifications(Long userId, boolean unreadOnly) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDateTime seenAt = user.getNotificationsSeenAt();

        return Stream.of(
                        userFollowRepository.findAllByFollowingIdAndFollowerIdNotOrderByCreatedAtDesc(userId, userId)
                                .stream()
                                .map(follow -> toFollowNotification(follow, seenAt)),
                        postLikeRepository.findAllByPostAuthorIdAndUserIdNotOrderByCreatedAtDesc(userId, userId)
                                .stream()
                                .map(like -> toLikeNotification(like, seenAt)),
                        postCommentRepository.findAllByPostAuthorIdAndAuthorIdNotOrderByCreatedAtDesc(userId, userId)
                                .stream()
                                .map(comment -> toCommentNotification(comment, seenAt))
                )
                .flatMap(stream -> stream)
                .filter(notification -> !unreadOnly || notification.isUnread())
                .sorted(Comparator.comparing(NotificationResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(unreadOnly ? 20 : 200)
                .toList();
    }

    @Override
    @Transactional
    public void markAllAsSeen(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setNotificationsSeenAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private NotificationResponse toFollowNotification(UserFollow follow, LocalDateTime seenAt) {
        return createNotification(
                "FOLLOW",
                follow.getFollower().getUsername(),
                "started following you",
                "/kullanici/" + follow.getFollower().getUsername(),
                follow.getCreatedAt(),
                seenAt
        );
    }

    private NotificationResponse toLikeNotification(PostLike like, LocalDateTime seenAt) {
        return createNotification(
                "LIKE",
                like.getUser().getUsername(),
                "liked your post",
                "/kullanici/" + like.getUser().getUsername(),
                like.getCreatedAt(),
                seenAt
        );
    }

    private NotificationResponse toCommentNotification(PostComment comment, LocalDateTime seenAt) {
        return createNotification(
                "COMMENT",
                comment.getAuthor().getUsername(),
                "commented on your post",
                "/kullanici/" + comment.getAuthor().getUsername(),
                comment.getCreatedAt(),
                seenAt
        );
    }

    private NotificationResponse createNotification(
            String type,
            String username,
            String message,
            String targetUrl,
            LocalDateTime createdAt,
            LocalDateTime seenAt
    ) {
        NotificationResponse response = new NotificationResponse();
        response.setType(type);
        response.setUsername(username);
        response.setMessage(message);
        response.setTargetUrl(targetUrl);
        response.setCreatedAt(createdAt);
        response.setUnread(seenAt == null || (createdAt != null && createdAt.isAfter(seenAt)));
        return response;
    }
}
