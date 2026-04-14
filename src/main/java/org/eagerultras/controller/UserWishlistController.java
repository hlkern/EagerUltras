package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.service.UserWishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-wishlist")
@RequiredArgsConstructor
public class UserWishlistController {

    private final UserWishlistService userWishlistService;

    @PostMapping("/{userId}/{stadiumId}")
    public ResponseEntity<Void> add(@PathVariable Long userId, @PathVariable Long stadiumId) {
        userWishlistService.addToWishlist(userId, stadiumId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/{stadiumId}")
    public ResponseEntity<Void> remove(@PathVariable Long userId, @PathVariable Long stadiumId) {
        userWishlistService.removeFromWishlist(userId, stadiumId);
        return ResponseEntity.noContent().build();
    }
}
