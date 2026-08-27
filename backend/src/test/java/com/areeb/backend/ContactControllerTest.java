package com.areeb.backend;

import com.areeb.backend.controller.ContactController;
import com.areeb.backend.dto.ContactDto;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.service.ContactService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactControllerTest {

    @Mock
    private ContactService contactService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Principal principal;

    @InjectMocks
    private ContactController contactController;

    private User mockUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        return user;
    }

    @Test
    void createContact_Success() {
        ContactDto dto = new ContactDto();
        dto.setFirstName("John");

        when(principal.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser()));
        when(contactService.createContact(eq(1L), any(ContactDto.class))).thenReturn(dto);

        ResponseEntity<ContactDto> response = contactController.createContact(principal, dto);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("John", response.getBody().getFirstName());
    }

    @Test
    void updateContact_Success() {
        ContactDto dto = new ContactDto();
        dto.setFirstName("Jane");

        when(principal.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser()));
        when(contactService.updateContact(eq(1L), eq(5L), any(ContactDto.class))).thenReturn(dto);

        ResponseEntity<ContactDto> response = contactController.updateContact(principal, 5L, dto);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Jane", response.getBody().getFirstName());
        verify(contactService).updateContact(1L, 5L, dto);
    }

    @Test
    void deleteContact_Success() {
        when(principal.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser()));
        doNothing().when(contactService).deleteContact(1L, 5L);

        ResponseEntity<Void> response = contactController.deleteContact(principal, 5L);

        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(contactService).deleteContact(1L, 5L);
    }

    @Test
    void getAllContacts_Success() {
        ContactDto dto = new ContactDto();
        dto.setFirstName("John");
        Page<ContactDto> page = new PageImpl<>(List.of(dto));

        when(principal.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser()));
        when(contactService.getAllContacts(eq(1L), any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<ContactDto>> response = contactController.getAllContacts(principal, 0, 10);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        assertEquals("John", response.getBody().getContent().get(0).getFirstName());
    }
}