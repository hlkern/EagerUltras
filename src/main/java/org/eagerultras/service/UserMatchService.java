package org.eagerultras.service;

import org.eagerultras.request.CreateUserMatchRequest;
import org.eagerultras.request.UpdateUserMatchRequest;
import org.eagerultras.response.UserMatchResponse;

import java.util.List;

public interface UserMatchService {

    UserMatchResponse create(Long userId, CreateUserMatchRequest request);

    List<UserMatchResponse> getByUserId(Long userId);

    UserMatchResponse update(Long userId, Long matchId, UpdateUserMatchRequest request);

    void delete(Long userId, Long matchId);
}
