package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.service.UserFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-follows")
@RequiredArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;

    @PostMapping("/{followerUserId}/{followingUserId}")
    public ResponseEntity<Void> follow(@PathVariable Long followerUserId, @PathVariable Long followingUserId) {
        userFollowService.follow(followerUserId, followingUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{followerUserId}/{followingUserId}")
    public ResponseEntity<Void> unfollow(@PathVariable Long followerUserId, @PathVariable Long followingUserId) {
        userFollowService.unfollow(followerUserId, followingUserId);
        return ResponseEntity.noContent().build();
    }
}

