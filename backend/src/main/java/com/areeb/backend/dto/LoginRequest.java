package com.areeb.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Username, email, or phone number is required")
    private String usernameOrEmailOrPhone;

    @NotBlank(message = "Password is required")
    private String password;

    public String getUsernameOrEmailOrPhone() {
        return usernameOrEmailOrPhone;
    }

    public void setUsernameOrEmailOrPhone(String usernameOrEmailOrPhone) {
        this.usernameOrEmailOrPhone = usernameOrEmailOrPhone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}