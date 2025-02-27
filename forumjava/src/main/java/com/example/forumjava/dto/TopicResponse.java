package com.example.forumjava.dto;

import com.example.forumjava.model.Topic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse author;
    private Integer viewCount;
    
    public static TopicResponse fromTopic(Topic topic) {
        TopicResponse response = new TopicResponse();
        response.setId(topic.getId());
        response.setTitle(topic.getTitle());
        response.setContent(topic.getContent());
        response.setCreatedAt(topic.getCreatedAt());
        response.setUpdatedAt(topic.getUpdatedAt());
        response.setViewCount(topic.getViewCount());
        
        if (topic.getAuthor() != null) {
            UserResponse authorResponse = new UserResponse();
            authorResponse.setId(topic.getAuthor().getId());
            authorResponse.setUsername(topic.getAuthor().getUsername());
            authorResponse.setFullName(topic.getAuthor().getFullName());
            authorResponse.setProfilePicture(topic.getAuthor().getProfilePicture());
            response.setAuthor(authorResponse);
        }
        
        return response;
    }
} 