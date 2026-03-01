package org.eagerultras.service;

import org.eagerultras.entity.User;
import org.eagerultras.response.UserResponse;

public interface UserService {

    UserResponse getById(Long id);

    User getByUsername(String username);

    User getByEmail(String email);

    User create(User user);
}
