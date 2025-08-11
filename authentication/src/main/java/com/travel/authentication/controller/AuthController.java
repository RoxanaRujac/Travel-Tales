package com.travel.authentication.controller;

import com.travel.authentication.dto.AuthDTO;
import com.travel.authentication.dto.AuthResponseDTO;
import com.travel.authentication.model.User;
import com.travel.authentication.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO authDTO) {
        try {
            User user = authService.login(authDTO);
            AuthResponseDTO response = new AuthResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getUsername(),
                    user.getEmail(),
                    "Login successful"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication failed", e.getMessage()));
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO authDTO) {
        try {
            User user = authService.register(authDTO);
            AuthResponseDTO response = new AuthResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getUsername(),
                    user.getEmail(),
                    "Registration successful"
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Registration failed", e.getMessage()));
        }
    }

    // For error responses
    private static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }
    }
}
