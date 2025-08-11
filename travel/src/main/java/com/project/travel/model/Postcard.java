package com.project.travel.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class Postcard {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    private User receiver;

    private String description;

    @ElementCollection
    private List<String> photoUrls;

}
