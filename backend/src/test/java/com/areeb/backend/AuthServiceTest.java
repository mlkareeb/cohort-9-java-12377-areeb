package com.areeb.backend;

import com.areeb.backend.dto.AuthResponse;
import com.areeb.backend.dto.LoginRequest;
import com.areeb.backend.dto.RegisterRequest;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.security.JwtUtil;
import com.areeb.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("areeb");
        request.setEmail("areeb@example.com");
        request.setPassword("password123");
        request.setPhoneNumber("1234567890");

        User user = new User();
        user.setUsername("areeb");
        user.setEmail("areeb@example.com");

        // The exact match for your AuthService implementation
        when(userRepository.existsAnywhere("areeb")).thenReturn(false);
        when(userRepository.existsAnywhere("areeb@example.com")).thenReturn(false);
        when(userRepository.existsAnywhere("1234567890")).thenReturn(false);

        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken("areeb")).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("areeb", response.getUsername());
    }

    @Test
    void testRegister_MissingEmailAndPhone_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("areeb");
        request.setPassword("password123");
        // no email, no phone

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmailOrPhone("areeb");
        request.setPassword("password123");

        User user = new User();
        user.setUsername("areeb");
        user.setEmail("areeb@example.com");

        when(userRepository.findByUsernameOrEmailOrPhoneNumber("areeb")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("areeb")).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("areeb", response.getUsername());
    }
}