package com.areeb.backend.service;

import com.areeb.backend.dto.ContactDto;
import com.areeb.backend.exception.ResourceNotFoundException;
import com.areeb.backend.model.Contact;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.ContactRepository;
import com.areeb.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class ContactExportImportServiceImpl implements ContactExportImportService {

    private static final Logger log = LoggerFactory.getLogger(ContactExportImportServiceImpl.class);

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public ContactExportImportServiceImpl(ContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String exportContactsToJson(Long userId) {
        log.info("Exporting contacts for userId: {}", userId);

        List<Contact> contacts = contactRepository.findByUserId(userId);
        List<ContactDto> contactDtos = new ArrayList<>();

        for (Contact contact : contacts) {
            ContactDto dto = new ContactDto(
                    contact.getId(),
                    contact.getFirstName(),
                    contact.getLastName(),
                    contact.getTitle(),
                    contact.getEmails() != null ? contact.getEmails() : new HashMap<>(),
                    contact.getPhoneNumbers() != null ? contact.getPhoneNumbers() : new HashMap<>()
            );
            contactDtos.add(dto);
        }

        try {
            String result = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(contactDtos);
            log.info("Exported {} contacts for userId: {}", contactDtos.size(), userId);
            return result;
        } catch (Exception e) {
            log.error("Failed to export contacts for userId: {}", userId, e);
            throw new IllegalArgumentException("Failed to export contacts: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void importContactsFromJson(Long userId, String jsonContent) {
        log.info("Importing contacts for userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (jsonContent == null || jsonContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Import content cannot be null or empty.");
        }

        try {
            List<ContactDto> contactDtos = objectMapper.readValue(jsonContent, new TypeReference<>() {});

            if (contactDtos == null) {
                throw new IllegalArgumentException("Imported contact list cannot be null.");
            }

            for (ContactDto dto : contactDtos) {
                if (dto == null) {
                    throw new IllegalArgumentException("Contact entry cannot be null.");
                }

                Contact contact = new Contact();
                contact.setFirstName(dto.getFirstName());
                contact.setLastName(dto.getLastName());
                contact.setTitle(dto.getTitle());
                contact.setEmails(dto.getEmails() != null ? dto.getEmails() : new HashMap<>());
                contact.setPhoneNumbers(dto.getPhoneNumbers() != null ? dto.getPhoneNumbers() : new HashMap<>());
                contact.setUser(user);

                contactRepository.save(contact);
            }

            log.info("Imported {} contacts for userId: {}", contactDtos.size(), userId);
        } catch (JsonProcessingException e) {
            log.error("Invalid JSON during contact import for userId: {}", userId, e);
            throw new IllegalArgumentException("Invalid JSON format for contact import: " + e.getMessage(), e);
        }
    }
}