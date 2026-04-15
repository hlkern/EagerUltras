package org.eagerultras.service;

import org.eagerultras.response.UserProfileResponse;

public interface UserProfileService {

    UserProfileResponse getByUsername(String username);
}

