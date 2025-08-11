package com.project.travel.mapper;

import com.project.travel.dto.JournalAdditionDTO;
import com.project.travel.model.Journal;

import java.time.LocalDateTime;

public class JournalMapper {

    /**
     * Convert a JournalAdditionDTO to a Journal entity
     * @param dto DTO to convert
     * @return Journal entity
     */
    public static Journal toEntity(JournalAdditionDTO dto) {
        return Journal.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now().toString())
                .coverImageURL(dto.getImageUrl())
                .userId(dto.getUserId())
                .build();
    }
}