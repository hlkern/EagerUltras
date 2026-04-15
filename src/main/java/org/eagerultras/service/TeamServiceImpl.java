package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.Team;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.TeamRepository;
import org.eagerultras.response.CountryResponse;
import org.eagerultras.response.TeamDetailResponse;
import org.eagerultras.response.TeamResponse;
import org.eagerultras.util.SlugUtil;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final StadiumRepository stadiumRepository;

    @Override
    public List<TeamResponse> getAll() {
        return teamRepository.findAllBy()
                .stream()
                .map(team -> {
                    TeamResponse response = new TeamResponse();
                    response.setId(team.getId());
                    response.setName(team.getName());
                    return response;
                })
                .toList();
    }

    @Override
    public TeamDetailResponse getBySlug(String slug) {
        Team team = teamRepository.findAllBy().stream()
                .filter(item -> SlugUtil.toSlug(item.getName()).equals(slug))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        TeamDetailResponse response = new TeamDetailResponse();
        response.setId(team.getId());
        response.setName(team.getName());

        CountryResponse countryResponse = new CountryResponse();
        if (team.getCountry() != null) {
            countryResponse.setId(team.getCountry().getId());
            countryResponse.setName(team.getCountry().getName());
            countryResponse.setCode(team.getCountry().getCode());
        }
        response.setCountry(countryResponse.getId() != null ? countryResponse : null);

        List<TeamDetailResponse.StadiumItem> stadiums = stadiumRepository.findAllBy().stream()
                .filter(stadium -> hasTeam(stadium, team.getId()))
                .map(stadium -> {
                    TeamDetailResponse.StadiumItem item = new TeamDetailResponse.StadiumItem();
                    item.setId(stadium.getId());
                    item.setName(stadium.getName());
                    item.setCity(stadium.getCity());
                    return item;
                })
                .toList();

        response.setStadiums(stadiums);
        return response;
    }

    private boolean hasTeam(Stadium stadium, Long teamId) {
        return stadium.getTeams() != null && stadium.getTeams().stream()
                .anyMatch(team -> team != null && teamId.equals(team.getId()));
    }
}
