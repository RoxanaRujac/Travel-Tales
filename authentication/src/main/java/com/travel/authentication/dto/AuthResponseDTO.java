package com.travel.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String message;

}