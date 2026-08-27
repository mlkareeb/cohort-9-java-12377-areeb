package com.areeb.backend;

import com.areeb.backend.dto.ContactDto;
import com.areeb.backend.model.Contact;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.ContactRepository;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.service.ContactServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ContactServiceImpl contactService;

    private User testUser;
    private Contact testContact;
    private ContactDto testContactDto;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("areeb");

        testContact = new Contact();
        testContact.setId(1L);
        testContact.setFirstName("John");
        testContact.setLastName("Doe");
        testContact.setUser(testUser);

        testContactDto = new ContactDto();
        testContactDto.setFirstName("John");
        testContactDto.setLastName("Doe");
    }

    @Test
    void createContact_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        ContactDto result = contactService.createContact(1L, testContactDto);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void getContactById_Success() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        ContactDto result = contactService.getContactById(1L, 1L);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
    }

    @Test
    void deleteContact_Success() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));
        doNothing().when(contactRepository).delete(testContact);

        contactService.deleteContact(1L, 1L);

        verify(contactRepository, times(1)).delete(testContact);
    }

    @Test
    void deleteContact_ThrowsAccessDenied_WhenNotOwner() {
        // testContact belongs to testUser (id=1L); a different user (id=2L)
        // must NOT be able to delete it
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        assertThrows(AccessDeniedException.class,
                () -> contactService.deleteContact(2L, 1L));

        verify(contactRepository, never()).delete(any(Contact.class));
    }

    @Test
    void getContactById_ThrowsAccessDenied_WhenNotOwner() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        assertThrows(AccessDeniedException.class,
                () -> contactService.getContactById(2L, 1L));
    }
}