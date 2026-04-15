package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.response.TeamDetailResponse;
import org.eagerultras.response.TeamResponse;
import org.eagerultras.service.TeamService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public List<TeamResponse> getAll() {
        return teamService.getAll();
    }

    @GetMapping("/by-slug/{slug:[a-z0-9-]+}")
    public TeamDetailResponse getBySlug(@PathVariable String slug) {
        return teamService.getBySlug(slug);
    }
}
