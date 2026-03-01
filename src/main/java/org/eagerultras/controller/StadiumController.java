package org.eagerultras.controller;

import lombok.extern.slf4j.Slf4j;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.service.StadiumService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/stadiums")
@RequiredArgsConstructor
public class StadiumController {

    private final StadiumService stadiumService;

    @GetMapping
    public List<StadiumResponse> getAllStadiums() {
        return stadiumService.getAll();
    }

    @GetMapping("/{id}")
    public StadiumResponse getStadiumById(@PathVariable Long id) {
        return stadiumService.getById(id);
    }

    @GetMapping("/debug")
    public StadiumResponse debug() {
        StadiumResponse r = new StadiumResponse();
        r.setId(999L);
        r.setName("DEBUG-CONTROLLER");
        log.error("DEBUG ENDPOINT HIT, id={}", r.getId());
        return r;
    }

}
