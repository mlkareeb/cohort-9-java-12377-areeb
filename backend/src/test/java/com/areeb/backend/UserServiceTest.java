package com.areeb.backend;

import com.areeb.backend.dto.ChangePasswordRequest;
import com.areeb.backend.dto.UserProfileResponse;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("areeb");
        testUser.setPassword("oldEncodedPassword");
        testUser.setEmail("areeb@example.com");
        testUser.setPhoneNumber("1234567890");
    }

    @Test
    void testGetUserProfile_Success() {
        when(userRepository.findByUsername("areeb")).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.getUserProfile("areeb");

        assertNotNull(response);
        assertEquals("areeb", response.getUsername());
        assertEquals("areeb@example.com", response.getEmail());
        assertEquals("1234567890", response.getPhoneNumber());
        verify(userRepository, times(1)).findByUsername("areeb");
    }

    @Test
    void testGetUserProfile_NotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getUserProfile("unknown"));
    }

    @Test
    void testChangePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest("oldPass", "newPass");

        when(userRepository.findByUsername("areeb")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPass", "oldEncodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncodedPassword");

        userService.changePassword("areeb", request);

        assertEquals("newEncodedPassword", testUser.getPassword());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testChangePassword_InvalidOldPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrongOldPass", "newPass");

        when(userRepository.findByUsername("areeb")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongOldPass", "oldEncodedPassword")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> userService.changePassword("areeb", request));

        verify(userRepository, never()).save(any(User.class));
    }
}