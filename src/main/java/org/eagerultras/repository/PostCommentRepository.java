package org.eagerultras.repository;

import org.eagerultras.entity.PostComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    @EntityGraph(attributePaths = {"author"})
    List<PostComment> findAllByPostIdOrderByCreatedAtAsc(Long postId);

    long countByPostId(Long postId);
}
