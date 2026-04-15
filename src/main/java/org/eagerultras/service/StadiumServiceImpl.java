package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.UserMatch;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.UserMatchRepository;
import org.eagerultras.response.StadiumInsightsResponse;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.util.SlugUtil;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StadiumServiceImpl implements StadiumService {

    private final StadiumRepository stadiumRepository;
    private final StadiumMapper stadiumMapper;
    private final UserMatchRepository userMatchRepository;

    @Override
    public List<StadiumResponse> getAll() {

        List<Stadium> list = stadiumRepository.findAllBy();

        list.forEach(s ->
                log.info("RAW ENTITY => id={}, name={}", s.getId(), s.getName())
        );

        return list.stream()
                .map(stadiumMapper::toResponse)
                .toList();
    }


    @Override
    public StadiumResponse getById(Long id) {
        Stadium stadium = stadiumRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Stadium not found. id={}", id);
                    return new IllegalArgumentException("Stadium not found");
                });

        return stadiumMapper.toResponse(stadium);
    }

    @Override
    public StadiumResponse getBySlug(String slug) {
        Stadium stadium = stadiumRepository.findAllBy().stream()
                .filter(item -> SlugUtil.toSlug(item.getName()).equals(slug))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Stadium not found. slug={}", slug);
                    return new IllegalArgumentException("Stadium not found");
                });

        return stadiumMapper.toResponse(stadium);
    }

    @Override
    public StadiumInsightsResponse getInsights(Long id) {
        List<UserMatch> matches = userMatchRepository.findAllByStadiumIdOrderByMatchAtDesc(id);

        List<Short> ratings = matches.stream()
                .map(UserMatch::getStadiumRating)
                .filter(rating -> rating != null)
                .toList();

        double average = ratings.isEmpty()
                ? 0.0
                : ratings.stream().mapToInt(Short::intValue).average().orElse(0.0);

        List<StadiumInsightsResponse.CommentItem> comments = matches.stream()
                .filter(match -> match.getComment() != null && !match.getComment().trim().isEmpty())
                .map(match -> {
                    StadiumInsightsResponse.CommentItem item = new StadiumInsightsResponse.CommentItem();
                    item.setUsername(match.getUser() != null ? match.getUser().getUsername() : "unknown");
                    item.setComment(match.getComment());
                    item.setRating(match.getStadiumRating());
                    item.setMatchAt(match.getMatchAt());
                    return item;
                })
                .toList();

        StadiumInsightsResponse response = new StadiumInsightsResponse();
        response.setAverageRating(average);
        response.setRatingCount(ratings.size());
        response.setComments(comments);
        return response;
    }
}