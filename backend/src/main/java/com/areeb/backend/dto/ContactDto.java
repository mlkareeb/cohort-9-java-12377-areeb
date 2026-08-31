package com.areeb.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ContactDto {

    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String title;
    private Map<String, String> emails;
    private Map<String, String> phoneNumbers;

    public ContactDto() {
    }

    public ContactDto(Long id, String firstName, String lastName, String title, Map<String, String> emails, Map<String, String> phoneNumbers) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.title = title;
        this.emails = emails;
        this.phoneNumbers = phoneNumbers;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Map<String, String> getEmails() {
        return emails;
    }

    public void setEmails(Object emailsObj) {
        this.emails = parseCollectionInput(emailsObj, "email");
    }

    public Map<String, String> getPhoneNumbers() {
        return phoneNumbers;
    }

    public void setPhoneNumbers(Object phoneNumbersObj) {
        this.phoneNumbers = parseCollectionInput(phoneNumbersObj, "phone");
    }

    private Map<String, String> parseCollectionInput(Object input, String prefix) {
        if (input == null) {
            return new HashMap<>();
        }

        return switch (input) {
            case Map<?, ?> rawMap -> {
                Map<String, String> resultMap = new HashMap<>();
                for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                    if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof String value)) {
                        throw new IllegalArgumentException("Map keys and values must be strings");
                    }
                    resultMap.put(key, value);
                }
                yield resultMap;
            }
            case List<?> list -> {
                Map<String, String> resultMap = new HashMap<>();
                for (int i = 0; i < list.size(); i++) {
                    Object item = list.get(i);
                    if (!(item instanceof String strItem)) {
                        throw new IllegalArgumentException("List elements must be non-null strings");
                    }
                    resultMap.put(prefix + (i + 1), strItem);
                }
                yield resultMap;
            }
            default -> throw new IllegalArgumentException("Invalid input type");
        };
    }
}