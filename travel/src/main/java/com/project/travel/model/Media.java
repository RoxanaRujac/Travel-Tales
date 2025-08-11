package com.project.travel.model;

import com.project.travel.constants.MediaType;
import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String url;

    @Enumerated(EnumType.STRING)
    private MediaType type;

    private String caption;
    private String createdAt;

}
