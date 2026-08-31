package com.areeb.backend.service;

import com.areeb.backend.dto.AuthResponse;
import com.areeb.backend.dto.LoginRequest;
import com.areeb.backend.dto.RegisterRequest;
import com.areeb.backend.exception.ResourceNotFoundException;
import com.areeb.backend.exception.UserAlreadyExistsException;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        log.info("Executing user registration request");

        if (request == null) {
            throw new IllegalArgumentException("Registration request must not be null");
        }

        if (!request.isEmailOrPhonePresent()) {
            throw new IllegalArgumentException("Either email or phone number is required");
        }

        // Normalize blank strings to null so we never persist "" for an optional identifier
        String normalizedEmail = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().trim() : null;
        String normalizedPhone = (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank())
                ? request.getPhoneNumber().trim() : null;

        if (userRepository.existsAnywhere(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists in the system");
        }
        if (normalizedEmail != null && userRepository.existsAnywhere(normalizedEmail)) {
            throw new UserAlreadyExistsException("Email already exists in the system");
        }
        if (normalizedPhone != null && userRepository.existsAnywhere(normalizedPhone)) {
            throw new UserAlreadyExistsException("Phone number already exists in the system");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(normalizedPhone);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            if (isDuplicateKeyViolation(e)) {
                log.warn("Registration blocked by duplicate-key constraint for username: {}", request.getUsername());
                throw new UserAlreadyExistsException("Username, email, or phone number already exists");
            }
            // Not a duplicate — wrap with context and rethrow so GlobalExceptionHandler's
            // general handler logs and handles it, instead of double-logging here.
            throw new DataIntegrityViolationException(
                    "Registration failed for username '" + request.getUsername() + "' due to a non-duplicate data integrity violation", e);
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    // Distinguishes a real duplicate-key violation (username/email/phone unique constraint)
    // from other integrity failures (null, length, etc.) using the root cause's SQL state /
    // message, since Spring doesn't always translate SQL Server violations into the more
    // specific DuplicateKeyException subtype.
    private boolean isDuplicateKeyViolation(DataIntegrityViolationException e) {
        Throwable rootCause = e.getRootCause();
        if (rootCause == null || rootCause.getMessage() == null) {
            return false;
        }
        String message = rootCause.getMessage().toLowerCase();
        return message.contains("unique") || message.contains("duplicate") || message.contains("uk_");
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Executing user authentication request");

        if (request == null) {
            throw new IllegalArgumentException("Login request must not be null");
        }

        String identifier = normalizeIdentifier(request.getUsernameOrEmailOrPhone());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        User user = userRepository.findByUsernameOrEmailOrPhoneNumber(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    // Trims the identifier only when it looks like an email or phone number (matching how
    // register() normalizes those two fields). Usernames are left untouched, since surrounding
    // characters could theoretically be meaningful and registration never trims username either.
    private String normalizeIdentifier(String identifier) {
        if (identifier == null) {
            return null;
        }
        String trimmed = identifier.trim();
        boolean looksLikeEmail = trimmed.contains("@");
        boolean looksLikePhone = trimmed.matches("^\\+?\\d{7,15}$");
        return (looksLikeEmail || looksLikePhone) ? trimmed : identifier;
    }
}