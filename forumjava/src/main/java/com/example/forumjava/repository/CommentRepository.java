package com.example.forumjava.repository;

import com.example.forumjava.model.Comment;
import com.example.forumjava.model.Topic;
import com.example.forumjava.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByTopic(Topic topic, Pageable pageable);
    Page<Comment> findByAuthor(User author, Pageable pageable);
} 