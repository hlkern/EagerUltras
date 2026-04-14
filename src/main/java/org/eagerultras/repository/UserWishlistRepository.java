package org.eagerultras.repository;

import org.eagerultras.entity.Stadium;
import org.eagerultras.entity.User;
import org.eagerultras.entity.UserWishlistStadium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserWishlistRepository extends JpaRepository<UserWishlistStadium, Long> {

    boolean existsByUserAndStadium(User user, Stadium stadium);

    Optional<UserWishlistStadium> findByUserAndStadium(User user, Stadium stadium);

    List<UserWishlistStadium> findAllByUser(User user);
}
