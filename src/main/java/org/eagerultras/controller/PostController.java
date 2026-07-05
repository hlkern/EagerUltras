package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.response.PostCommentResponse;
import org.eagerultras.response.PostResponse;
import org.eagerultras.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public List<PostResponse> getTimeline(@RequestParam(value = "userId", required = false) Long userId) {
        return postService.getTimeline(userId);
    }

    @PostMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse createPost(@PathVariable Long userId,
                                   @RequestParam("content") String content,
                                   @RequestParam(value = "image", required = false) MultipartFile image) {
        return postService.createPost(userId, content, image);
    }

    @PostMapping("/{postId}/likes/{userId}")
    public Map<String, Object> toggleLike(@PathVariable Long postId, @PathVariable Long userId) {
        return postService.toggleLike(postId, userId);
    }

    @GetMapping("/{postId}/comments")
    public List<PostCommentResponse> getComments(@PathVariable Long postId) {
        return postService.getComments(postId);
    }

    @PostMapping("/{postId}/comments/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public PostCommentResponse addComment(@PathVariable Long postId,
                                          @PathVariable Long userId,
                                          @RequestBody Map<String, String> body) {
        return postService.addComment(postId, userId, body.get("content"));
    }
}
