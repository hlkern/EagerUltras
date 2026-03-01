package org.eagerultras.mapper;

import org.eagerultras.entity.Stadium;
import org.eagerultras.response.StadiumResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

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
    @Mapping(source = "country", target = "country")
    StadiumResponse toResponse(Stadium stadium);
}
