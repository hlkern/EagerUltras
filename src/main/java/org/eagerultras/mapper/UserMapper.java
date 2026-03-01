package org.eagerultras.mapper;

import org.eagerultras.entity.User;
import org.eagerultras.response.UserResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
