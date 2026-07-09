package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserMatch;
import org.eagerultras.entity.UserWishlistStadium;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.UserFollowRepository;
import org.eagerultras.repository.UserMatchRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.repository.UserWishlistRepository;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.response.TeamResponse;
import org.eagerultras.response.UserProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final UserMatchRepository userMatchRepository;
    private final UserWishlistRepository userWishlistRepository;
    private final UserFollowRepository userFollowRepository;
    private final StadiumMapper stadiumMapper;

    @Override
    public UserProfileResponse getByUsername(String username, Long viewerUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<UserProfileResponse.MatchItem> matches = userMatchRepository.findAllByUserIdOrderByMatchAtDesc(user.getId())
                .stream()
                .map(this::toMatchItem)
                .toList();

        List<StadiumResponse> wishlist = userWishlistRepository.findAllByUserOrderByAddedAtDesc(user)
                .stream()
                .map(UserWishlistStadium::getStadium)
                .map(stadiumMapper::toResponse)
                .toList();

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFollowerCount(userFollowRepository.countByFollowingId(user.getId()));
        response.setFollowingCount(userFollowRepository.countByFollowerId(user.getId()));

        boolean ownProfile = viewerUserId != null && viewerUserId.equals(user.getId());
        boolean followedByViewer = viewerUserId != null
                && !ownProfile
                && userFollowRepository.existsByFollowerIdAndFollowingId(viewerUserId, user.getId());
        boolean followsViewer = viewerUserId != null
                && !ownProfile
                && userFollowRepository.existsByFollowerIdAndFollowingId(user.getId(), viewerUserId);

        response.setOwnProfile(ownProfile);
        response.setFollowedByViewer(followedByViewer);
        response.setFollowsViewer(followsViewer);
        response.setMatches(matches);
        response.setWishlist(wishlist);
        return response;
    }

    private UserProfileResponse.MatchItem toMatchItem(UserMatch match) {
        UserProfileResponse.MatchItem item = new UserProfileResponse.MatchItem();
        item.setId(match.getId());
        item.setStadium(stadiumMapper.toResponse(match.getStadium()));
        item.setHomeTeam(toTeamResponse(match.getHomeTeam()));
        item.setAwayTeam(toTeamResponse(match.getAwayTeam()));
        item.setMatchAt(match.getMatchAt());
        item.setStadiumRating(match.getStadiumRating());
        item.setComment(match.getComment());
        return item;
    }

    private TeamResponse toTeamResponse(org.eagerultras.entity.Team team) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());
        return response;
    }
}

