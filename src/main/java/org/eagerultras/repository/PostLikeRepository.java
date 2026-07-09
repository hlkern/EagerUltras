package org.eagerultras.repository;

import org.eagerultras.entity.PostLike;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPostId(Long postId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    @EntityGraph(attributePaths = {"user", "post", "post.author"})
    List<PostLike> findAllByPostAuthorIdAndUserIdNotOrderByCreatedAtDesc(Long authorId, Long userId);
}
