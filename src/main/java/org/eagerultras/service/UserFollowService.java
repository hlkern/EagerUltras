package org.eagerultras.service;

public interface UserFollowService {

    void follow(Long followerUserId, Long followingUserId);

    void unfollow(Long followerUserId, Long followingUserId);
}

