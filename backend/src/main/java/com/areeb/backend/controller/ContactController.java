package com.areeb.backend.controller;

import com.areeb.backend.dto.ContactDto;
import com.areeb.backend.exception.ResourceNotFoundException;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.UserRepository;
import com.areeb.backend.service.ContactExportImportService;
import com.areeb.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;
    private final UserRepository userRepository;
    private final ContactExportImportService exportImportService;

    @Autowired
    public ContactController(ContactService contactService, UserRepository userRepository, ContactExportImportService exportImportService) {
        this.contactService = contactService;
        this.userRepository = userRepository;
        this.exportImportService = exportImportService;
    }

    private Long getUserId(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<ContactDto> createContact(Principal principal, @Valid @RequestBody ContactDto contactDto) {
        Long userId = getUserId(principal);
        ContactDto createdContact = contactService.createContact(userId, contactDto);
        return new ResponseEntity<>(createdContact, HttpStatus.CREATED);
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<ContactDto> updateContact(
            Principal principal,
            @PathVariable Long contactId,
            @Valid @RequestBody ContactDto contactDto) {
        Long userId = getUserId(principal);
        ContactDto updatedContact = contactService.updateContact(userId, contactId, contactDto);
        return ResponseEntity.ok(updatedContact);
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> deleteContact(Principal principal, @PathVariable Long contactId) {
        Long userId = getUserId(principal);
        contactService.deleteContact(userId, contactId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<ContactDto> getContactById(Principal principal, @PathVariable Long contactId) {
        Long userId = getUserId(principal);
        ContactDto contactDto = contactService.getContactById(userId, contactId);
        return ResponseEntity.ok(contactDto);
    }

    @GetMapping
    public ResponseEntity<Page<ContactDto>> getAllContacts(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(principal);
        int safePage = Math.max(0, page);
        int safeSize = Math.clamp(size, 1, 50);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        Page<ContactDto> contacts = contactService.getAllContacts(userId, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ContactDto>> searchContacts(
            Principal principal,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(principal);
        int safePage = Math.max(0, page);
        int safeSize = Math.clamp(size, 1, 50);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        Page<ContactDto> contacts = contactService.searchContacts(userId, query, pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportContacts(Principal principal) {
        Long userId = getUserId(principal);
        String jsonOutput = exportImportService.exportContactsToJson(userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contacts.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonOutput);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importContacts(Principal principal, @RequestBody String jsonContent) {
        Long userId = getUserId(principal);
        exportImportService.importContactsFromJson(userId, jsonContent);
        return ResponseEntity.ok("Contacts imported successfully");
    }
}