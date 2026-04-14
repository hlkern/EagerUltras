package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserWishlistStadium;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.repository.UserWishlistRepository;
import org.eagerultras.response.StadiumResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserWishlistServiceImpl implements UserWishlistService {

    private final UserRepository userRepository;
    private final StadiumRepository stadiumRepository;
    private final UserWishlistRepository userWishlistRepository;
    private final StadiumMapper stadiumMapper;

    @Override
    public void addToWishlist(Long userId, Long stadiumId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(() -> new NoSuchElementException("Stadium not found"));

        if (userWishlistRepository.existsByUserAndStadium(user, stadium)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stadium already in wishlist");
        }

        UserWishlistStadium entry = new UserWishlistStadium();
        entry.setUser(user);
        entry.setStadium(stadium);
        entry.setAddedAt(LocalDateTime.now());

        try {
            userWishlistRepository.save(entry);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stadium already in wishlist");
        }

        log.info("Stadium added to wishlist. userId={}, stadiumId={}", userId, stadiumId);
    }

    @Override
    public void removeFromWishlist(Long userId, Long stadiumId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(() -> new NoSuchElementException("Stadium not found"));

        UserWishlistStadium entry = userWishlistRepository.findByUserAndStadium(user, stadium)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stadium not found in wishlist"));

        userWishlistRepository.delete(entry);
        log.info("Stadium removed from wishlist. userId={}, stadiumId={}", userId, stadiumId);
    }

    @Override
    public List<StadiumResponse> getWishlist(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        return userWishlistRepository.findAllByUser(user)
                .stream()
                .map(UserWishlistStadium::getStadium)
                .map(stadiumMapper::toResponse)
                .toList();
    }
}
