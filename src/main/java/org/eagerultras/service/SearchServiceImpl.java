package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.repository.CountryRepository;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.TeamRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.response.SearchItemResponse;
import org.eagerultras.util.SlugUtil;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final CountryRepository countryRepository;
    private final TeamRepository teamRepository;
    private final StadiumRepository stadiumRepository;
    private final UserRepository userRepository;

    @Override
    public List<SearchItemResponse> search(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }

        String query = q.trim();
        String normalizedQuery = SlugUtil.toSlug(query);

        List<SearchCandidate> candidates = new ArrayList<>();

        countryRepository.findTop8ByNameContainingIgnoreCaseOrderByNameAsc(query)
                .forEach(country -> candidates.add(new SearchCandidate(
                        toCountryItem(country.getName(), country.getCode()),
                        score(country.getName(), normalizedQuery),
                        country.getName()
                )));

        teamRepository.findTop8ByNameContainingIgnoreCaseOrderByNameAsc(query)
                .forEach(team -> candidates.add(new SearchCandidate(
                        toTeamItem(team.getName()),
                        score(team.getName(), normalizedQuery),
                        team.getName()
                )));

        stadiumRepository.findTop8ByNameContainingIgnoreCaseOrderByNameAsc(query)
                .forEach(stadium -> candidates.add(new SearchCandidate(
                        toStadiumItem(stadium.getName(), stadium.getCountry() != null ? stadium.getCountry().getName() : "Stadyum"),
                        score(stadium.getName(), normalizedQuery),
                        stadium.getName()
                )));

        userRepository.findTop8ByUsernameContainingIgnoreCaseOrderByUsernameAsc(query)
                .forEach(user -> candidates.add(new SearchCandidate(
                        toUserItem(user.getUsername()),
                        score(user.getUsername(), normalizedQuery),
                        user.getUsername()
                )));

        return candidates.stream()
                .sorted(Comparator
                        .comparingInt(SearchCandidate::score).reversed()
                        .thenComparing(c -> c.sortLabel().toLowerCase()))
                .map(SearchCandidate::item)
                .limit(15)
                .toList();
    }

    private SearchItemResponse toCountryItem(String name, String code) {
        SearchItemResponse item = new SearchItemResponse();
        item.setType("COUNTRY");
        item.setLabel(name);
        item.setSubtitle(code);
        item.setSeoPath("/" + SlugUtil.toSlug(name));
        return item;
    }

    private SearchItemResponse toTeamItem(String name) {
        SearchItemResponse item = new SearchItemResponse();
        item.setType("TEAM");
        item.setLabel(name);
        item.setSubtitle("Takim");
        item.setSeoPath("/takim/" + SlugUtil.toSlug(name));
        return item;
    }

    private SearchItemResponse toStadiumItem(String name, String subtitle) {
        SearchItemResponse item = new SearchItemResponse();
        item.setType("STADIUM");
        item.setLabel(name);
        item.setSubtitle(subtitle);
        item.setSeoPath("/stadyum/" + SlugUtil.toSlug(name));
        return item;
    }

    private SearchItemResponse toUserItem(String username) {
        SearchItemResponse item = new SearchItemResponse();
        item.setType("USER");
        item.setLabel(username);
        item.setSubtitle("Kullanici");
        item.setSeoPath("/kullanici/" + username);
        return item;
    }

    private int score(String value, String normalizedQuery) {
        String normalizedValue = SlugUtil.toSlug(value);
        if (normalizedValue.startsWith(normalizedQuery)) {
            return 3;
        }
        if (normalizedValue.contains(normalizedQuery)) {
            return 2;
        }
        return 1;
    }

    private record SearchCandidate(SearchItemResponse item, int score, String sortLabel) {
    }
}
