package com.example.forumjava.controller;

import com.example.forumjava.dto.TopicRequest;
import com.example.forumjava.dto.TopicResponse;
import com.example.forumjava.model.Topic;
import com.example.forumjava.model.User;
import com.example.forumjava.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    public ResponseEntity<Page<TopicResponse>> getAllTopics(@PageableDefault(size = 10) Pageable pageable) {
        Page<Topic> topics = topicService.getAllTopics(pageable);
        Page<TopicResponse> topicResponses = topics.map(TopicResponse::fromTopic);
        return ResponseEntity.ok(topicResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponse> getTopicById(@PathVariable Long id) {
        Topic topic = topicService.incrementViewCount(id);
        return ResponseEntity.ok(TopicResponse.fromTopic(topic));
    }

    @PostMapping
    public ResponseEntity<TopicResponse> createTopic(@RequestBody TopicRequest topicRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        Topic topic = new Topic();
        topic.setTitle(topicRequest.getTitle());
        topic.setContent(topicRequest.getContent());
        
        Topic createdTopic = topicService.createTopic(topic, currentUser.getId());
        return ResponseEntity.ok(TopicResponse.fromTopic(createdTopic));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicResponse> updateTopic(@PathVariable Long id, @RequestBody TopicRequest topicRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        Topic topicToUpdate = new Topic();
        topicToUpdate.setTitle(topicRequest.getTitle());
        topicToUpdate.setContent(topicRequest.getContent());
        
        Topic updatedTopic = topicService.updateTopic(id, topicToUpdate, currentUser.getId());
        return ResponseEntity.ok(TopicResponse.fromTopic(updatedTopic));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        topicService.deleteTopic(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<TopicResponse>> getTopicsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Topic> topics = topicService.getTopicsByUser(userId, pageable);
        Page<TopicResponse> topicResponses = topics.map(TopicResponse::fromTopic);
        return ResponseEntity.ok(topicResponses);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TopicResponse>> searchTopics(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Topic> topics = topicService.searchTopics(query, pageable);
        Page<TopicResponse> topicResponses = topics.map(TopicResponse::fromTopic);
        return ResponseEntity.ok(topicResponses);
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id) {
        topicService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }
} 