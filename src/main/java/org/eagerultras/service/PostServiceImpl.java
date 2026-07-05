package org.eagerultras.service;

import lombok.RequiredArgsConstructor;
import org.eagerultras.entity.Post;
import org.eagerultras.entity.PostComment;
import org.eagerultras.entity.PostLike;
import org.eagerultras.entity.User;
import org.eagerultras.repository.PostCommentRepository;
import org.eagerultras.repository.PostLikeRepository;
import org.eagerultras.repository.PostRepository;
import org.eagerultras.repository.UserRepository;
import org.eagerultras.response.PostCommentResponse;
import org.eagerultras.response.PostResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getTimeline(Long currentUserId) {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> toResponse(post, currentUserId))
                .toList();
    }

    @Override
    @Transactional
    public PostResponse createPost(Long userId, String content, MultipartFile image) {
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Icerik bos olamaz");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanici bulunamadi"));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Post post = new Post();
        post.setAuthor(author);
        post.setContent(normalizedContent);
        post.setImageUrl(imageUrl);

        return toResponse(postRepository.save(post), userId);
    }

    @Override
    @Transactional
    public Map<String, Object> toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gonderi bulunamadi"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanici bulunamadi"));

        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(postId, userId);

        boolean liked;
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            liked = false;
        } else {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            liked = true;
        }

        long likeCount = postLikeRepository.countByPostId(postId);
        return Map.of("liked", liked, "likeCount", likeCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostCommentResponse> getComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gonderi bulunamadi");
        }
        return postCommentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Override
    @Transactional
    public PostCommentResponse addComment(Long postId, Long userId, String content) {
        String normalized = content == null ? "" : content.trim();
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Yorum bos olamaz");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gonderi bulunamadi"));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanici bulunamadi"));

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(normalized);

        return toCommentResponse(postCommentRepository.save(comment));
    }

    private String saveImage(MultipartFile file) {
        try {
            String original = file.getOriginalFilename();
            String safeName = (original == null ? "img" : original).replaceAll("[^a-zA-Z0-9._-]", "_");
            String filename = UUID.randomUUID() + "_" + safeName;
            Path uploadPath = Path.of(uploadDir);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Fotograf yuklenemedi");
        }
    }

    private PostResponse toResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorUsername(post.getAuthor().getUsername());
        response.setContent(post.getContent());
        response.setImageUrl(post.getImageUrl());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikeCount((int) postLikeRepository.countByPostId(post.getId()));
        response.setCommentCount((int) postCommentRepository.countByPostId(post.getId()));
        response.setLikedByCurrentUser(currentUserId != null && postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUserId));
        return response;
    }

    private PostCommentResponse toCommentResponse(PostComment comment) {
        PostCommentResponse response = new PostCommentResponse();
        response.setId(comment.getId());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorUsername(comment.getAuthor().getUsername());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}
