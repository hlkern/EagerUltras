package org.eagerultras.service;

import org.eagerultras.response.StadiumResponse;

import java.util.List;

public interface UserStadiumService {

    void setAsVisited(Long userId, Long stadiumId);

    List<StadiumResponse> getVisitedStadiums(Long userId);
}
