package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserFollow;
import org.eagerultras.repository.UserFollowRepository;
import org.eagerultras.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserFollowServiceImpl implements UserFollowService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;

    @Override
    public void follow(Long followerUserId, Long followingUserId) {
        validateNotSelf(followerUserId, followingUserId);

        User follower = userRepository.findById(followerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follower user not found"));
        User following = userRepository.findById(followingUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (userFollowRepository.existsByFollowerIdAndFollowingId(followerUserId, followingUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu kullaniciyi zaten takip ediyorsun");
        }

        UserFollow follow = new UserFollow();
        follow.setFollower(follower);
        follow.setFollowing(following);

        try {
            userFollowRepository.save(follow);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu kullaniciyi zaten takip ediyorsun");
        }
    }

    @Override
    public void unfollow(Long followerUserId, Long followingUserId) {
        validateNotSelf(followerUserId, followingUserId);

        UserFollow follow = userFollowRepository.findByFollowerIdAndFollowingId(followerUserId, followingUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Takip kaydi bulunamadi"));

        userFollowRepository.delete(follow);
    }

    private void validateNotSelf(Long followerUserId, Long followingUserId) {
        if (followerUserId == null || followingUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kullanici id zorunlu");
        }
        if (followerUserId.equals(followingUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kendini takip edemezsin");
        }
    }
}

