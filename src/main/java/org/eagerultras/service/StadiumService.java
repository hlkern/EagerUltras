package org.eagerultras.service;

import org.eagerultras.response.StadiumInsightsResponse;
import org.eagerultras.response.StadiumResponse;

import java.util.List;

public interface StadiumService {

    List<StadiumResponse> getAll();

    StadiumResponse getById(Long id);

    StadiumInsightsResponse getInsights(Long id);
}
