package org.eagerultras.repository;

import org.eagerultras.entity.UserMatch;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMatchRepository extends JpaRepository<UserMatch, Long> {

    @EntityGraph(attributePaths = {"stadium", "stadium.country", "homeTeam", "awayTeam"})
    List<UserMatch> findAllByUserIdOrderByMatchAtDesc(Long userId);

    @EntityGraph(attributePaths = {"stadium", "stadium.country", "homeTeam", "awayTeam"})
    Optional<UserMatch> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<UserMatch> findAllByStadiumIdOrderByMatchAtDesc(Long stadiumId);
}
