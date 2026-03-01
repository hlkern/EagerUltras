package org.eagerultras.service;

import org.eagerultras.request.StadiumVisitedRequest;
import org.eagerultras.response.StadiumResponse;

import java.util.List;

public interface UserStadiumService {

    void setAsVisited(StadiumVisitedRequest request);

    List<StadiumResponse> getVisitedStadiums(Long userId);
}
