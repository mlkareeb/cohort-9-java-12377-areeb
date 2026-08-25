package com.areeb.backend.service;

import com.areeb.backend.dto.ContactDto;
import com.areeb.backend.exception.ResourceNotFoundException;
import com.areeb.backend.model.Contact;
import com.areeb.backend.model.User;
import com.areeb.backend.repository.ContactRepository;
import com.areeb.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContactServiceImpl implements ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactServiceImpl.class);
    private static final String CONTACT_NOT_FOUND = "Contact not found with id: ";

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Autowired
    public ContactServiceImpl(ContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ContactDto createContact(Long userId, ContactDto contactDto) {
        log.info("Creating contact for userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Contact contact = mapToEntity(contactDto);
        contact.setId(null); // never trust a client-supplied id on create
        contact.setUser(user);

        Contact savedContact = contactRepository.save(contact);
        log.info("Created contact with id: {} for userId: {}", savedContact.getId(), userId);
        return mapToDto(savedContact);
    }

    @Override
    public ContactDto updateContact(Long userId, Long contactId, ContactDto contactDto) {
        log.info("Updating contact id: {} for userId: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND + contactId));

        if (!contact.getUser().getId().equals(userId)) {
            log.warn("Unauthorized attempt by userId: {} to update contact id: {}", userId, contactId);
            throw new AccessDeniedException("Unauthorized access to contact");
        }

        contact.setFirstName(contactDto.getFirstName());
        contact.setLastName(contactDto.getLastName());
        contact.setTitle(contactDto.getTitle());
        contact.setEmails(contactDto.getEmails());
        contact.setPhoneNumbers(contactDto.getPhoneNumbers());

        Contact updatedContact = contactRepository.save(contact);
        log.info("Updated contact id: {}", contactId);
        return mapToDto(updatedContact);
    }

    @Override
    public void deleteContact(Long userId, Long contactId) {
        log.info("Deleting contact id: {} for userId: {}", contactId, userId);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND + contactId));

        if (!contact.getUser().getId().equals(userId)) {
            log.warn("Unauthorized attempt by userId: {} to delete contact id: {}", userId, contactId);
            throw new AccessDeniedException("Unauthorized access to contact");
        }

        contactRepository.delete(contact);
        log.info("Deleted contact id: {}", contactId);
    }

    @Override
    public ContactDto getContactById(Long userId, Long contactId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND + contactId));

        if (!contact.getUser().getId().equals(userId)) {
            log.warn("Unauthorized attempt by userId: {} to access contact id: {}", userId, contactId);
            throw new AccessDeniedException("Unauthorized access to contact");
        }

        return mapToDto(contact);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContactDto> getAllContacts(Long userId, Pageable pageable) {
        Page<Contact> contacts = contactRepository.findByUserId(userId, pageable);
        return contacts.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContactDto> searchContacts(Long userId, String query, Pageable pageable) {
        Page<Contact> contacts = contactRepository.searchContacts(userId, query, pageable);
        return contacts.map(this::mapToDto);
    }

    private ContactDto mapToDto(Contact contact) {
        return new ContactDto(
                contact.getId(),
                contact.getFirstName(),
                contact.getLastName(),
                contact.getTitle(),
                contact.getEmails(),
                contact.getPhoneNumbers()
        );
    }

    private Contact mapToEntity(ContactDto contactDto) {
        Contact contact = new Contact();
        contact.setId(contactDto.getId());
        contact.setFirstName(contactDto.getFirstName());
        contact.setLastName(contactDto.getLastName());
        contact.setTitle(contactDto.getTitle());
        contact.setEmails(contactDto.getEmails());
        contact.setPhoneNumbers(contactDto.getPhoneNumbers());
        return contact;
    }
}