package com.project.travel.dto;

import com.project.travel.model.Media;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EntryAdditionDTO {
    @NotBlank(message = "Title cannot be blank")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    private String content;

    @Size(max = 100, message = "Location name cannot exceed 100 characters")
    private String locationName;

    private String latitude;
    private String longitude;

    @Valid
    private List<Media> mediaList;
}
