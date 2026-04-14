package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserStadium;
import org.eagerultras.mapper.StadiumMapper;
import org.eagerultras.repository.StadiumRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.repository.UserStadiumRepository;
import org.eagerultras.response.StadiumResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserStadiumServiceImpl implements UserStadiumService {

    private final UserRepository userRepository;
    private final StadiumRepository stadiumRepository;
    private final UserStadiumRepository userStadiumRepository;
    private final StadiumMapper stadiumMapper;

    @Override
    public void setAsVisited(Long userId, Long stadiumId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found. id={}", userId);
                    return new NoSuchElementException("User not found");
                });

        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(() -> {
                    log.error("Stadium not found. id={}", stadiumId);
                    return new NoSuchElementException("Stadium not found");
                });

        if (userStadiumRepository.existsByUserAndStadium(user, stadium)) {
            log.error("Stadium already visited. userId={}, stadiumId={}", userId, stadiumId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stadium already visited");
        }

        UserStadium userStadium = new UserStadium();
        userStadium.setUser(user);
        userStadium.setStadium(stadium);
        userStadium.setVisitDate(LocalDate.now());

        try {
            userStadiumRepository.save(userStadium);
        } catch (DataIntegrityViolationException ex) {
            log.error("Duplicate visit prevented by DB. userId={}, stadiumId={}", userId, stadiumId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stadium already visited");
        }

        log.info("Stadium marked as visited. userId={}, stadiumId={}", userId, stadiumId);
    }

    @Override
    public List<StadiumResponse> getVisitedStadiums(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found. id={}", userId);
                    return new IllegalArgumentException("User not found");
                });

        return userStadiumRepository.findAllByUser(user)
                .stream()
                .map(UserStadium::getStadium)
                .map(stadiumMapper::toResponse)
                .toList();
    }
}
