package org.eagerultras.service;

import org.eagerultras.response.StadiumResponse;

import java.util.List;

public interface UserWishlistService {

    void addToWishlist(Long userId, Long stadiumId);

    void removeFromWishlist(Long userId, Long stadiumId);

    List<StadiumResponse> getWishlist(Long userId);
}
