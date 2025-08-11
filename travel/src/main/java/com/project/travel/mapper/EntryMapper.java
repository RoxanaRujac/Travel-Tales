package com.project.travel.mapper;
import com.project.travel.dto.EntryAdditionDTO;
import com.project.travel.model.Entry;
import com.project.travel.model.Journal;

import java.time.LocalDateTime;

public class EntryMapper {
    /**
     * Convert an EntryAdditionDTO to an Entry entity
     * @param dto DTO to convert
     * @return Entry entity
     */
    public static Entry toEntity(EntryAdditionDTO dto) {
        return Entry.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .createdAt(LocalDateTime.now().toString())
                .locationName(dto.getLocationName())
                .mediaAttachments(dto.getMediaList())
                .build();
    }
}
