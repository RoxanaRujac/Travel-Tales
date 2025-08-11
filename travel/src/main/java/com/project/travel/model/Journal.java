package com.project.travel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class Journal {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank(message = "Title cannot be blank")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;

    @Column(name = "cover_imageurl")

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String coverImageURL;
    private String description;
    private String createdAt;

    @Column(name = "user_id")
    private Long userId;
}
