package com.travel.authentication.dto;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserCreationDTO {
    private String username;
    private String email;
    private String password;
}
