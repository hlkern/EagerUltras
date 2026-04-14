package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.service.UserStadiumService;
import org.eagerultras.service.UserWishlistService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserStadiumService userStadiumService;
    private final UserWishlistService userWishlistService;

    @GetMapping("/{userId}/stadiums")
    public List<StadiumResponse> getVisitedStadiums(@PathVariable Long userId) {
        return userStadiumService.getVisitedStadiums(userId);
    }

    @GetMapping("/{userId}/wishlist")
    public List<StadiumResponse> getWishlist(@PathVariable Long userId) {
        return userWishlistService.getWishlist(userId);
    }
}
