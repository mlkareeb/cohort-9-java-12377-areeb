package com.areeb.backend.service;

import com.areeb.backend.dto.ChangePasswordRequest;
import com.areeb.backend.dto.UserProfileResponse;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));
        return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getPhoneNumber());
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request body");
        }

        log.info("Processing password change request for username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));

        String oldPass = request.getOldPassword();
        if (oldPass == null || !passwordEncoder.matches(oldPass, user.getPassword())) {
            log.warn("Failed password change attempt for username: {} - incorrect old password", username);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully changed for username: {}", username);
    }
}