package com.areeb.backend;

import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindByUsername() {
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john@example.com");
        user.setPassword("encoded_password");

        userRepository.save(user);

        Optional<User> foundUser = userRepository.findByUsername("john_doe");
        assertTrue(foundUser.isPresent());
        assertEquals("john@example.com", foundUser.get().getEmail());
    }

    @Test
    void testExistsByEmail() {
        User user = new User();
        user.setUsername("jane_doe");
        user.setEmail("jane@example.com");
        user.setPassword("encoded_password");

        userRepository.save(user);

        boolean exists = userRepository.existsByEmail("jane@example.com");
        assertTrue(exists);
    }

    @Test
    void testFindByUsernameOrEmailOrPhoneNumber() {
        User user = new User();
        user.setUsername("mike_doe");
        user.setEmail("mike@example.com");
        user.setPassword("encoded_password");
        user.setPhoneNumber("5551234567");
        userRepository.save(user);

        assertTrue(userRepository.findByUsernameOrEmailOrPhoneNumber("mike_doe").isPresent());
        assertTrue(userRepository.findByUsernameOrEmailOrPhoneNumber("mike@example.com").isPresent());
        assertTrue(userRepository.findByUsernameOrEmailOrPhoneNumber("5551234567").isPresent());
    }
}