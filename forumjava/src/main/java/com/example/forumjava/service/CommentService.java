package com.example.forumjava.service;

import com.example.forumjava.model.Comment;
import com.example.forumjava.model.Topic;
import com.example.forumjava.model.User;
import com.example.forumjava.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TopicService topicService;
    private final UserService userService;

    public Page<Comment> getCommentsByTopic(Long topicId, Pageable pageable) {
        Topic topic = topicService.getTopicById(topicId);
        return commentRepository.findByTopic(topic, pageable);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Yorum bulunamadı: ID " + id));
    }

    @Transactional
    public Comment createComment(Comment comment, Long topicId, Long userId) {
        Topic topic = topicService.getTopicById(topicId);
        User author = userService.getUserById(userId);
        
        comment.setTopic(topic);
        comment.setAuthor(author);
        
        return commentRepository.save(comment);
    }

    @Transactional
    public Comment updateComment(Long id, Comment commentDetails, Long userId) {
        Comment comment = getCommentById(id);
        
        // Yalnızca yorum sahibi veya admin güncelleyebilir
        if (!comment.getAuthor().getId().equals(userId) && 
            !userService.getUserById(userId).getRole().equals(User.Role.ADMIN)) {
            throw new IllegalArgumentException("Bu yorumu güncelleme yetkiniz yok");
        }
        
        if (commentDetails.getContent() != null) {
            comment.setContent(commentDetails.getContent());
        }
        
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long id, Long userId) {
        Comment comment = getCommentById(id);
        
        // Yalnızca yorum sahibi veya admin silebilir
        if (!comment.getAuthor().getId().equals(userId) && 
            !userService.getUserById(userId).getRole().equals(User.Role.ADMIN)) {
            throw new IllegalArgumentException("Bu yorumu silme yetkiniz yok");
        }
        
        commentRepository.delete(comment);
    }

    public Page<Comment> getCommentsByUser(Long userId, Pageable pageable) {
        User author = userService.getUserById(userId);
        return commentRepository.findByAuthor(author, pageable);
    }
} 