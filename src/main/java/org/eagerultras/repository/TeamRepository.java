package org.eagerultras.repository;

import org.eagerultras.entity.Team;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    @EntityGraph(attributePaths = {"country"})
    List<Team> findAllBy();

    @EntityGraph(attributePaths = {"country"})
    List<Team> findTop8ByNameContainingIgnoreCaseOrderByNameAsc(String q);
}
