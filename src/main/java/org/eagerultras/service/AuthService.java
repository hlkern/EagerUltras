package org.eagerultras.service;

import org.eagerultras.request.LoginRequest;
import org.eagerultras.request.RegisterRequest;
import org.eagerultras.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}

