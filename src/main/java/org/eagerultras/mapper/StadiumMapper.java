package org.eagerultras.mapper;

import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.Team;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.response.TeamResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface StadiumMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "city", target = "city")
    @Mapping(source = "capacity", target = "capacity")
    @Mapping(source = "latitude", target = "latitude")
    @Mapping(source = "longitude", target = "longitude")
    @Mapping(source = "teams", target = "teams")
    @Mapping(source = "country", target = "country")
    StadiumResponse toResponse(Stadium stadium);

    TeamResponse toTeamResponse(Team team);

    List<TeamResponse> toTeamResponses(Set<Team> teams);
}
