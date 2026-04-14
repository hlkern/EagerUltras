package org.eagerultras.controller;

import org.eagerultras.service.UserStadiumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-stadiums")
@RequiredArgsConstructor
public class UserStadiumController {

    private final UserStadiumService userStadiumService;

    @PostMapping("/{userId}/{stadiumId}")
    public ResponseEntity<Void> setStadiumAsVisited(@PathVariable("userId") Long userId,
                                                    @PathVariable("stadiumId") Long stadiumId) {
        userStadiumService.setAsVisited(userId, stadiumId);
        return ResponseEntity.noContent().build();
    }
}
