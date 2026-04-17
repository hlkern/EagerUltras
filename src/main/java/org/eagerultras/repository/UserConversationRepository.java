package org.eagerultras.repository;

import org.eagerultras.entity.UserConversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserConversationRepository extends JpaRepository<UserConversation, Long> {

    @EntityGraph(attributePaths = {"userA", "userB"})
    List<UserConversation> findByUserAIdOrUserBIdOrderByUpdatedAtDesc(Long userAId, Long userBId);

    @EntityGraph(attributePaths = {"userA", "userB"})
    Optional<UserConversation> findByUserAIdAndUserBId(Long userAId, Long userBId);
}

