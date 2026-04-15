package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserMatch;
import org.eagerultras.entity.UserWishlistStadium;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.UserMatchRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.repository.UserWishlistRepository;
import org.eagerultras.response.DashboardHighlightsResponse;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserMatchRepository userMatchRepository;
    private final UserWishlistRepository userWishlistRepository;
    private final StadiumMapper stadiumMapper;

    @Override
    public DashboardHighlightsResponse getHighlights(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        DashboardHighlightsResponse response = new DashboardHighlightsResponse();

        UserMatch latestMatch = userMatchRepository.findTopByUserIdOrderByMatchAtDesc(userId).orElse(null);
        if (latestMatch != null && latestMatch.getStadium() != null) {
            response.setLatestVisitedStadium(stadiumMapper.toResponse(latestMatch.getStadium()));
            response.setLatestVisitedMatchAt(latestMatch.getMatchAt());
        }

        UserWishlistStadium latestWishlist = userWishlistRepository.findTopByUserOrderByAddedAtDesc(user).orElse(null);
        if (latestWishlist != null && latestWishlist.getStadium() != null) {
            response.setLatestWishlistStadium(stadiumMapper.toResponse(latestWishlist.getStadium()));
        }

        return response;
    }
}

