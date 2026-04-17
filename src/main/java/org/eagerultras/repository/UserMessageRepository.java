package org.eagerultras.repository;

import org.eagerultras.entity.UserMessage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMessageRepository extends JpaRepository<UserMessage, Long> {

    @EntityGraph(attributePaths = {"sender"})
    List<UserMessage> findAllByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<UserMessage> findTopByConversationIdOrderByCreatedAtDesc(Long conversationId);
}

