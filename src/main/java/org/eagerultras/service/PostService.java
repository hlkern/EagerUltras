package org.eagerultras.service;

import org.eagerultras.response.PostCommentResponse;
import org.eagerultras.response.PostResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface PostService {

    List<PostResponse> getTimeline(Long currentUserId);

    PostResponse createPost(Long userId, String content, MultipartFile image);

    Map<String, Object> toggleLike(Long postId, Long userId);

    List<PostCommentResponse> getComments(Long postId);

    PostCommentResponse addComment(Long postId, Long userId, String content);
}
