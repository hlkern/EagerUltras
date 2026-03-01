package org.eagerultras.repository;

import org.eagerultras.entity.Stadium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface StadiumRepository extends JpaRepository<Stadium, Long> {
;
}
