package org.eagerultras.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.eagerultras.request.CreateUserMatchRequest;
import org.eagerultras.request.SetUserMatchReactionRequest;
import org.eagerultras.request.UpdateUserMatchRequest;
import org.eagerultras.response.FollowedMatchFeedResponse;
import org.eagerultras.response.UserMatchResponse;
import org.eagerultras.service.UserMatchService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/matches")
@RequiredArgsConstructor
public class UserMatchController {

    private final UserMatchService userMatchService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserMatchResponse create(@PathVariable Long userId,
                                    @Valid @RequestBody CreateUserMatchRequest request) {
        return userMatchService.create(userId, request);
    }

    @GetMapping
    public List<UserMatchResponse> getByUserId(@PathVariable Long userId) {
        return userMatchService.getByUserId(userId);
    }

    @GetMapping("/feed")
    public List<FollowedMatchFeedResponse> getFeedForFollower(@PathVariable Long userId) {
        return userMatchService.getFeedForFollower(userId);
    }

    @PutMapping("/{matchId}")
    public UserMatchResponse update(@PathVariable Long userId,
                                    @PathVariable Long matchId,
                                    @Valid @RequestBody UpdateUserMatchRequest request) {
        return userMatchService.update(userId, matchId, request);
    }

    @DeleteMapping("/{matchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long userId, @PathVariable Long matchId) {
        userMatchService.delete(userId, matchId);
    }

    @PutMapping("/{matchId}/reaction")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setReaction(@PathVariable Long userId,
                            @PathVariable Long matchId,
                            @Valid @RequestBody SetUserMatchReactionRequest request) {
        userMatchService.setCommentReaction(userId, matchId, request.getReaction());
    }

    @DeleteMapping("/{matchId}/reaction")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeReaction(@PathVariable Long userId,
                               @PathVariable Long matchId) {
        userMatchService.removeCommentReaction(userId, matchId);
    }
}
