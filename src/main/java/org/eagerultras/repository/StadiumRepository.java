package org.eagerultras.repository;

import org.eagerultras.entity.Stadium;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StadiumRepository extends JpaRepository<Stadium, Long> {

    @EntityGraph(attributePaths = {"country", "teams"})
    List<Stadium> findAllBy();

    @EntityGraph(attributePaths = {"country", "teams"})
    Optional<Stadium> findById(Long id);

    @EntityGraph(attributePaths = {"country", "teams"})
    List<Stadium> findTop8ByNameContainingIgnoreCaseOrderByNameAsc(String q);
}
