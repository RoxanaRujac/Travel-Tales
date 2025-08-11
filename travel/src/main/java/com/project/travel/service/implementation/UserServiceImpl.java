package com.project.travel.service.implementation;

import com.project.travel.dto.UserCreationDTO;
import com.project.travel.mapper.UserMapper;
import com.project.travel.model.User;
import com.project.travel.repository.UserRepository;
import com.project.travel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User createUser(UserCreationDTO userDTO) {
        // Check if username or email already exists
        if (existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        if (existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Convert DTO to entity
        User user = UserMapper.toEntity(userDTO);

        // Set additional fields
        user.setCreatedAt(LocalDateTime.now().toString());

        // Encrypt password
        String hashedPassword = passwordEncoder.encode(userDTO.getPassword());
        user.setPassword(hashedPassword);

        // Initialize empty journals list
        user.setJournals(new ArrayList<>());

        // Save user
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) {
        // Check if user exists
        if (!userRepository.existsById(user.getId())) {
            throw new NoSuchElementException("User not found with id: " + user.getId());
        }

        // Get existing user to preserve fields that shouldn't be updated
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        // Update fields
        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setUsername(user.getUsername());

        // Only update password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(user.getPassword());
            existingUser.setPassword(hashedPassword);
        }


        // Save updated user
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        // Check if user exists
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
    }
}