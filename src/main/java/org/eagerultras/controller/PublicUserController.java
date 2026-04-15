package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.response.UserProfileResponse;
import org.eagerultras.service.UserProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/users")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserProfileService userProfileService;

    @GetMapping("/{username}")
    public UserProfileResponse getByUsername(@PathVariable String username) {
        return userProfileService.getByUsername(username);
    }
}

