package com.example.forumjava.repository;

import com.example.forumjava.model.Topic;
import com.example.forumjava.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    Page<Topic> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Topic> findByAuthor(User author, Pageable pageable);
    Page<Topic> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content, Pageable pageable);
} 