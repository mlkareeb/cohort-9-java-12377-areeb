package com.areeb.backend;

import com.areeb.backend.model.Contact;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.ContactRepository;
import com.areeb.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ContactRepositoryTest {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindByUserId() {
        User user = new User();
        user.setUsername("contact_owner");
        user.setEmail("owner@example.com");
        user.setPassword("password");
        user = userRepository.save(user);

        Contact contact = new Contact();
        contact.setFirstName("Alice");
        contact.setLastName("Smith");
        contact.setUser(user);

        contactRepository.save(contact);

        List<Contact> contacts = contactRepository.findByUserId(user.getId());
        assertFalse(contacts.isEmpty());
        assertEquals("Alice", contacts.getFirst().getFirstName());
    }

    @Test
    void testSearchContacts() {
        User user = new User();
        user.setUsername("search_owner");
        user.setEmail("search_owner@example.com");
        user.setPassword("password");
        user = userRepository.save(user);

        Contact contact1 = new Contact();
        contact1.setFirstName("Bob");
        contact1.setLastName("Marley");
        contact1.setUser(user);
        contactRepository.save(contact1);

        Contact contact2 = new Contact();
        contact2.setFirstName("Carol");
        contact2.setLastName("Danvers");
        contact2.setUser(user);
        contactRepository.save(contact2);

        Page<Contact> results = contactRepository.searchContacts(
                user.getId(), "bob", PageRequest.of(0, 10));

        assertEquals(1, results.getTotalElements());
        assertEquals("Bob", results.getContent().get(0).getFirstName());
    }
}