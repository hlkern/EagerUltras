package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eagerultras.entity.User;
import org.eagerultras.mapper.UserMapper;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.response.UserResponse;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found. id={}", id);
                    return new NoSuchElementException("User not found");
                });

        return userMapper.toResponse(user);
    }

    @Override
    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    @Override
    public User create(User user) {
        return userRepository.save(user);
    }
}
