package org.eagerultras.repository;

import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserStadium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStadiumRepository extends JpaRepository<UserStadium, Long> {

    boolean existsByUserAndStadium(User user, Stadium stadium);

    List<UserStadium> findAllByUser(User user);
}
