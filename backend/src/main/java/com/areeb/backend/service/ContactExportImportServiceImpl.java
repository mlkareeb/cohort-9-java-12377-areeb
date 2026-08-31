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
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Service
public class ContactExportImportServiceImpl implements ContactExportImportService {

    private static final Logger log = LoggerFactory.getLogger(ContactExportImportServiceImpl.class);

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @Autowired
    public ContactExportImportServiceImpl(ContactRepository contactRepository, UserRepository userRepository, Validator validator) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        this.validator = validator;
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

            // Jackson deserialization does not trigger jakarta.validation constraints
            // (those only fire via @Valid on a controller argument). This endpoint accepts
            // a raw JSON string body, so without an explicit pass here, contacts with a
            // null/blank firstName or lastName would reach the database, either creating
            // invalid records or failing at the DB's nullable=false constraint mid-import.
            // Validate every entry up front and reject the whole batch on any failure,
            // rather than partially importing before hitting a bad row.
            List<String> validationErrors = new ArrayList<>();
            for (int i = 0; i < contactDtos.size(); i++) {
                ContactDto dto = contactDtos.get(i);
                if (dto == null) {
                    validationErrors.add("Entry " + (i + 1) + ": contact cannot be null");
                    continue;
                }

                Set<ConstraintViolation<ContactDto>> violations = validator.validate(dto);
                for (ConstraintViolation<ContactDto> violation : violations) {
                    validationErrors.add("Entry " + (i + 1) + " (" + violation.getPropertyPath() + "): " + violation.getMessage());
                }
            }

            if (!validationErrors.isEmpty()) {
                String message = "Import failed due to invalid contact entries: " + String.join("; ", validationErrors);
                log.warn(message);
                throw new IllegalArgumentException(message);
            }

            for (ContactDto dto : contactDtos) {
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