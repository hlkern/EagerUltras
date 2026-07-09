package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eagerultras.entity.ReactionType;
import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.Team;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserFollow;
import org.eagerultras.entity.UserMatch;
import org.eagerultras.entity.UserMatchCommentReaction;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.TeamRepository;
import org.eagerultras.repository.UserFollowRepository;
import org.eagerultras.repository.UserMatchCommentReactionRepository;
import org.eagerultras.repository.UserMatchRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.request.CreateUserMatchRequest;
import org.eagerultras.request.UpdateUserMatchRequest;
import org.eagerultras.response.FollowedMatchFeedResponse;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.response.TeamResponse;
import org.eagerultras.response.UserMatchResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserMatchServiceImpl implements UserMatchService {

    private final UserRepository userRepository;
    private final StadiumRepository stadiumRepository;
    private final TeamRepository teamRepository;
    private final UserFollowRepository userFollowRepository;
    private final UserMatchRepository userMatchRepository;
    private final UserMatchCommentReactionRepository userMatchCommentReactionRepository;
    private final StadiumMapper stadiumMapper;

    @Override
    public UserMatchResponse create(Long userId, CreateUserMatchRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Stadium stadium = stadiumRepository.findById(request.getStadiumId())
                .orElseThrow(() -> new NoSuchElementException("Stadium not found"));

        Team homeTeam = teamRepository.findById(request.getHomeTeamId())
                .orElseThrow(() -> new NoSuchElementException("Home team not found"));

        Team awayTeam = teamRepository.findById(request.getAwayTeamId())
                .orElseThrow(() -> new NoSuchElementException("Away team not found"));

        if (homeTeam.getId().equals(awayTeam.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Home and away teams must be different");
        }

        if (!stadiumHasTeam(stadium, homeTeam.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected teams do not play in this stadium");
        }

        UserMatch userMatch = new UserMatch();
        userMatch.setUser(user);
        userMatch.setStadium(stadium);
        userMatch.setHomeTeam(homeTeam);
        userMatch.setAwayTeam(awayTeam);
        userMatch.setMatchAt(request.getMatchAt());
        userMatch.setStadiumRating(request.getStadiumRating());
        userMatch.setComment(request.getComment());

        try {
            UserMatch saved = userMatchRepository.save(userMatch);
            log.info("User match created. userId={}, matchId={}", userId, saved.getId());
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This match is already in collection");
        }
    }

    @Override
    public List<UserMatchResponse> getByUserId(Long userId) {
        return userMatchRepository.findAllByUserIdOrderByMatchAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<FollowedMatchFeedResponse> getFeedForFollower(Long userId) {
        List<Long> followingIds = userFollowRepository.findAllByFollowerId(userId).stream()
                .map(UserFollow::getFollowing)
                .map(User::getId)
                .distinct()
                .toList();

        if (followingIds.isEmpty()) {
            return List.of();
        }

        return userMatchRepository.findAllByUserIdInOrderByCreatedAtDesc(followingIds).stream()
                .map(this::toFeedResponse)
                .toList();
    }

    @Override
    public UserMatchResponse update(Long userId, Long matchId, UpdateUserMatchRequest request) {
        UserMatch userMatch = getOwnedMatch(userId, matchId);

        userMatch.setStadiumRating(request.getStadiumRating());
        userMatch.setComment(request.getComment());

        UserMatch saved = userMatchRepository.save(userMatch);
        log.info("User match updated. userId={}, matchId={}", userId, matchId);
        return toResponse(saved);
    }

    @Override
    public void delete(Long userId, Long matchId) {
        UserMatch userMatch = getOwnedMatch(userId, matchId);
        userMatchRepository.delete(userMatch);
        log.info("User match deleted. userId={}, matchId={}", userId, matchId);
    }

    @Override
    public void setCommentReaction(Long userId, Long matchId, ReactionType reactionType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        UserMatch userMatch = userMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        if (userMatch.getComment() == null || userMatch.getComment().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This match has no comment");
        }

        UserMatchCommentReaction reaction = userMatchCommentReactionRepository.findByUserAndUserMatch(user, userMatch)
                .orElseGet(() -> {
                    UserMatchCommentReaction item = new UserMatchCommentReaction();
                    item.setUser(user);
                    item.setUserMatch(userMatch);
                    return item;
                });

        reaction.setReactionType(reactionType);
        userMatchCommentReactionRepository.save(reaction);
    }

    @Override
    public void removeCommentReaction(Long userId, Long matchId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        UserMatch userMatch = userMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        userMatchCommentReactionRepository.findByUserAndUserMatch(user, userMatch)
                .ifPresent(userMatchCommentReactionRepository::delete);
    }

    private UserMatch getOwnedMatch(Long userId, Long matchId) {
        return userMatchRepository.findByIdAndUserId(matchId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));
    }

    private boolean stadiumHasTeam(Stadium stadium, Long teamId) {
        return stadium.getTeams().stream().anyMatch(team -> team.getId().equals(teamId));
    }

    private UserMatchResponse toResponse(UserMatch userMatch) {
        UserMatchResponse response = new UserMatchResponse();
        response.setId(userMatch.getId());
        response.setStadium(toStadiumResponse(userMatch.getStadium()));
        response.setHomeTeam(toTeamResponse(userMatch.getHomeTeam()));
        response.setAwayTeam(toTeamResponse(userMatch.getAwayTeam()));
        response.setMatchAt(userMatch.getMatchAt());
        response.setStadiumRating(userMatch.getStadiumRating());
        response.setComment(userMatch.getComment());
        response.setCreatedAt(userMatch.getCreatedAt());
        return response;
    }

    private FollowedMatchFeedResponse toFeedResponse(UserMatch userMatch) {
        FollowedMatchFeedResponse response = new FollowedMatchFeedResponse();
        response.setId(userMatch.getId());
        response.setUserId(userMatch.getUser().getId());
        response.setUsername(userMatch.getUser().getUsername());
        response.setStadium(toStadiumResponse(userMatch.getStadium()));
        response.setHomeTeam(toTeamResponse(userMatch.getHomeTeam()));
        response.setAwayTeam(toTeamResponse(userMatch.getAwayTeam()));
        response.setMatchAt(userMatch.getMatchAt());
        response.setStadiumRating(userMatch.getStadiumRating());
        response.setComment(userMatch.getComment());
        response.setCreatedAt(userMatch.getCreatedAt());
        return response;
    }

    private StadiumResponse toStadiumResponse(Stadium stadium) {
        return stadiumMapper.toResponse(stadium);
    }

    private TeamResponse toTeamResponse(Team team) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());
        return response;
    }
}
