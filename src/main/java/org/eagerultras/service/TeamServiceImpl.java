package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.repository.TeamRepository;
import org.eagerultras.response.TeamResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;

    @Override
    public List<TeamResponse> getAll() {
        return teamRepository.findAll()
                .stream()
                .map(team -> {
                    TeamResponse response = new TeamResponse();
                    response.setId(team.getId());
                    response.setName(team.getName());
                    return response;
                })
                .toList();
    }
}
