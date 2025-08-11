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
public class Entry {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String content;
    private String locationName;
    private String longitude;
    private String latitude;
    private String createdAt;

    @Column(name = "journal_id")
    private Long journalId;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "entry_media_attachments",
            joinColumns = @JoinColumn(name = "entry_id"),
            inverseJoinColumns = @JoinColumn(name = "media_attachments_id")
    )
    private List<Media> mediaAttachments;
}
