package com.project.travel.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;
    private String username;
    private String email;
    private String password;
    private String createdAt;

    @OneToMany(fetch = FetchType.EAGER)
    private List<Journal> journals;
}
