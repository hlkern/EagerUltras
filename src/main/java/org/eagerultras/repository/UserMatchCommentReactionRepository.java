package org.eagerultras.repository;

import org.eagerultras.entity.User;
import org.eagerultras.entity.UserMatch;
import org.eagerultras.entity.UserMatchCommentReaction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMatchCommentReactionRepository extends JpaRepository<UserMatchCommentReaction, Long> {

    @EntityGraph(attributePaths = {"user", "userMatch"})
    List<UserMatchCommentReaction> findAllByUserMatchIdIn(List<Long> userMatchIds);

    Optional<UserMatchCommentReaction> findByUserAndUserMatch(User user, UserMatch userMatch);
}

