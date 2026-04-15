package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.repository.CountryRepository;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.TeamRepository;
import org.eagerultras.util.SlugUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
public class SeoRouteController {

    private final CountryRepository countryRepository;
    private final TeamRepository teamRepository;
    private final StadiumRepository stadiumRepository;

    @GetMapping("/takim/{slug:[a-z0-9-]+}")
    public String teamPage(@PathVariable String slug) {
        return teamRepository.findAll().stream()
                .filter(team -> SlugUtil.toSlug(team.getName()).equals(slug))
                .findFirst()
                .map(team -> "redirect:/teams.html?teamSlug=" + slug)
                .orElse("redirect:/teams.html");
    }

    @GetMapping("/stadyum/{slug:[a-z0-9-]+}")
    public String stadiumPage(@PathVariable String slug) {
        return stadiumRepository.findAllBy().stream()
                .filter(stadium -> SlugUtil.toSlug(stadium.getName()).equals(slug))
                .findFirst()
                .map(stadium -> "redirect:/stadium-detail.html?stadiumSlug=" + slug)
                .orElse("redirect:/stadiums.html");
    }

    @GetMapping("/{slug:[a-z0-9-]+}")
    public String countryPage(@PathVariable String slug) {
        return countryRepository.findAll().stream()
                .filter(country -> SlugUtil.toSlug(country.getName()).equals(slug))
                .findFirst()
                .map(country -> "redirect:/countries.html?countrySlug=" + slug)
                .orElse("redirect:/main.html");
    }
}
