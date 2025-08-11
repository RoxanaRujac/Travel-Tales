package com.project.travel.controller;

import com.project.travel.dto.UserCreationDTO;
import com.project.travel.model.User;
import com.project.travel.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(
            summary = "Get all users",
            description = "Fetches a list of all users in the system"
    )
    @ApiResponse(responseCode = "200", description = "List of users")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(
            summary = "Get user by ID",
            description = "Fetches a user by their ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            Optional<User> user = userService.getUserById(id);
            return user.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Create a new user",
            description = "Creates a new user in the system"
    )
    @ApiResponse(responseCode = "201", description = "User created successfully")
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserCreationDTO userDTO) {
        User createdUser = userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(
            summary = "Update user information",
            description = "Updates an existing user's information"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            user.setId(id);
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Delete a user",
            description = "Deletes a user from the system by their ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Get user by username",
            description = "Fetches a user by their username"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}