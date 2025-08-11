package com.project.travel.dto;
import lombok.*;
import com.project.travel.validation.ValidJournalTitle;
import jakarta.validation.constraints.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class JournalAdditionDTO {

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Long userId;

    @NotBlank(message = "Title cannot be blank")
    @ValidJournalTitle
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Pattern(regexp = "^(https?://.*\\.(jpg|jpeg|png|gif|webp))$|^$",
            message = "Image URL must be a valid HTTP/HTTPS URL ending with jpg, jpeg, png, gif, or webp")
    private String imageUrl;
}

