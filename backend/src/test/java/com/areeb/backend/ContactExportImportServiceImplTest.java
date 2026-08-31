package com.areeb.backend;

import com.areeb.backend.model.Contact;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.ContactRepository;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.service.ContactExportImportServiceImpl;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContactExportImportServiceImplTest {

    private ContactRepository contactRepository;
    private UserRepository userRepository;
    private Validator validator;
    private ContactExportImportServiceImpl exportImportService;

    @BeforeEach
    void setUp() {
        contactRepository = mock(ContactRepository.class);
        userRepository = mock(UserRepository.class);
        validator = mock(Validator.class);
        exportImportService = new ContactExportImportServiceImpl(contactRepository, userRepository, validator);
    }

    @Test
    void testExportContactsToJson() {
        Long userId = 1L;
        List<Contact> contacts = new ArrayList<>();
        Contact contact = new Contact();
        contact.setId(10L);
        contact.setFirstName("John");
        contact.setLastName("Doe");
        contacts.add(contact);

        when(contactRepository.findByUserId(userId)).thenReturn(contacts);

        String jsonResult = exportImportService.exportContactsToJson(userId);

        assertNotNull(jsonResult);
        assertTrue(jsonResult.contains("John"));
        assertTrue(jsonResult.contains("Doe"));
        verify(contactRepository, times(1)).findByUserId(userId);
    }

    @Test
    void testImportContactsFromJson() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(validator.validate(ArgumentMatchers.any())).thenReturn(java.util.Collections.emptySet());
        when(contactRepository.save(ArgumentMatchers.any(Contact.class))).thenReturn(new Contact());

        // Updated JSON to match proper map/object structure for labeled fields
        String jsonContent = "[{\"firstName\":\"Jane\",\"lastName\":\"Doe\",\"title\":\"Dev\",\"emails\":{},\"phoneNumbers\":{}}]";

        assertDoesNotThrow(() -> exportImportService.importContactsFromJson(userId, jsonContent));
        verify(userRepository, times(1)).findById(userId);
        verify(contactRepository, times(1)).save(ArgumentMatchers.any(Contact.class));
    }
}