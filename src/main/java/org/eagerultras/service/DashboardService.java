package org.eagerultras.service;

import org.eagerultras.response.DashboardHighlightsResponse;

public interface DashboardService {

    DashboardHighlightsResponse getHighlights(Long userId);
}

