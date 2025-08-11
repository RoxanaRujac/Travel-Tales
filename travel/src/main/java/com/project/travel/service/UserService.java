package com.project.travel.service;

import com.project.travel.dto.UserCreationDTO;
import com.project.travel.model.User;

import java.util.List;
import java.util.Optional;


public interface UserService {

    /**
     * Get all users
     * @return List of all users
     */
    List<User> getAllUsers();

    /**
     * Get a user by ID
     * @param id User ID
     * @return Optional containing the user if found
     */
    Optional<User> getUserById(Long id);

    /**
     * Get a user by username
     * @param username Username to search
     * @return Optional containing the user if found
     */
    Optional<User> getUserByUsername(String username);

    /**
     * Get a user by email
     * @param email Email to search
     * @return Optional containing the user if found
     */
    Optional<User> getUserByEmail(String email);

    /**
     * Check if a username exists
     * @param username Username to check
     * @return True if the username exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Check if an email exists
     * @param email Email to check
     * @return True if the email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Create a new user
     * @param userDTO User creation data
     * @return The created user
     */
    User createUser(UserCreationDTO userDTO);

    /**
     * Update an existing user
     * @param user Updated user data
     * @return The updated user
     */
    User updateUser(User user);

    /**
     * Delete a user by ID
     * @param id ID of the user to delete
     */
    void deleteUser(Long id);
}