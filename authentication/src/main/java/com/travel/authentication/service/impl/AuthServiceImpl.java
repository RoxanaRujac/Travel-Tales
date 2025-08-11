package com.travel.authentication.service.impl;

import com.travel.authentication.dto.AuthDTO;
import com.travel.authentication.model.User;
import com.travel.authentication.repository.UserRepository;
import com.travel.authentication.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) //PasswordEncoder passwordEncoder)
    {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User login(AuthDTO auth) {
        Optional<User> userOpt = userRepository.findByUsername(auth.getUsername());

        if (userOpt.isEmpty()) {
            throw new NoSuchElementException("User or password incorrect");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(auth.getPassword(), user.getPassword())) {
            throw new NoSuchElementException("User or password incorrect");
        }

        return user;
    }

    @Override
    public User register(AuthDTO auth) {
        if (userRepository.existsByUsername(auth.getUsername())) {
            throw new IllegalArgumentException("This username already exists");
        }

        if (userRepository.existsByEmail(auth.getEmail())) {
            throw new IllegalArgumentException("This email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(auth.getPassword());

        User user = User.builder()
                .name(auth.getName())
                .username(auth.getUsername())
                .email(auth.getEmail())
                .password(hashedPassword)
                .createdAt(LocalDateTime.now().toString())
                .build();

        return userRepository.save(user);
    }
}