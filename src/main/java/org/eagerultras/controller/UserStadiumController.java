package org.eagerultras.controller;

import org.eagerultras.request.StadiumVisitedRequest;
import org.eagerultras.service.UserStadiumService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-stadiums")
@RequiredArgsConstructor
public class UserStadiumController {

    private final UserStadiumService userStadiumService;

    @PostMapping("/{userId}/{stadiumId}")
    public void setStadiumAsVisited(@RequestBody StadiumVisitedRequest request) {
        userStadiumService.setAsVisited(request);
    }
}
