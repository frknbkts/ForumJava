package com.example.forumjava.service;

import com.example.forumjava.model.Topic;
import com.example.forumjava.model.User;
import com.example.forumjava.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final UserService userService;

    public Page<Topic> getAllTopics(Pageable pageable) {
        return topicRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Topic getTopicById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Konu bulunamadı: ID " + id));
    }

    @Transactional
    public Topic createTopic(Topic topic, Long userId) {
        User author = userService.getUserById(userId);
        topic.setAuthor(author);
        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateTopic(Long id, Topic topicDetails, Long userId) {
        Topic topic = getTopicById(id);
        
        // Yalnızca konu sahibi veya admin güncelleyebilir
        if (!topic.getAuthor().getId().equals(userId) && 
            !userService.getUserById(userId).getRole().equals(User.Role.ADMIN)) {
            throw new IllegalArgumentException("Bu konuyu güncelleme yetkiniz yok");
        }
        
        if (topicDetails.getTitle() != null) {
            topic.setTitle(topicDetails.getTitle());
        }
        if (topicDetails.getContent() != null) {
            topic.setContent(topicDetails.getContent());
        }
        
        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteTopic(Long id, Long userId) {
        Topic topic = getTopicById(id);
        
        // Yalnızca konu sahibi veya admin silebilir
        if (!topic.getAuthor().getId().equals(userId) && 
            !userService.getUserById(userId).getRole().equals(User.Role.ADMIN)) {
            throw new IllegalArgumentException("Bu konuyu silme yetkiniz yok");
        }
        
        topicRepository.delete(topic);
    }

    public Page<Topic> getTopicsByUser(Long userId, Pageable pageable) {
        User author = userService.getUserById(userId);
        return topicRepository.findByAuthor(author, pageable);
    }

    public Page<Topic> searchTopics(String query, Pageable pageable) {
        return topicRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query, pageable);
    }

    @Transactional
    public Topic incrementViewCount(Long id) {
        Topic topic = getTopicById(id);
        topic.setViewCount(topic.getViewCount() + 1);
        return topicRepository.save(topic);
    }
} 