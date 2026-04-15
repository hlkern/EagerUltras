package org.eagerultras.service;

import org.eagerultras.response.TeamDetailResponse;
import org.eagerultras.response.TeamResponse;

import java.util.List;

public interface TeamService {

    List<TeamResponse> getAll();

    TeamDetailResponse getBySlug(String slug);
}
