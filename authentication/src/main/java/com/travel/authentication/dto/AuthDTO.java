package com.travel.authentication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.processing.Pattern;

@Setter
@Getter
public class AuthDTO {
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    private String username;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 3, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;
}
