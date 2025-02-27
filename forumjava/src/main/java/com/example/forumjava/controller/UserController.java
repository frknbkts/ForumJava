package com.example.forumjava.controller;

import com.example.forumjava.dto.UserUpdateRequest;
import com.example.forumjava.model.User;
import com.example.forumjava.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@RequestBody UserUpdateRequest userUpdateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        User userToUpdate = new User();
        userToUpdate.setFullName(userUpdateRequest.getFullName());
        userToUpdate.setBio(userUpdateRequest.getBio());
        userToUpdate.setProfilePicture(userUpdateRequest.getProfilePicture());
        
        User updatedUser = userService.updateUser(currentUser.getId(), userToUpdate);
        return ResponseEntity.ok(updatedUser);
    }
} 