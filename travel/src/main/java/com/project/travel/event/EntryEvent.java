package com.project.travel.event;

import com.project.travel.constants.EntryEventType;
import com.project.travel.model.Entry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class EntryEvent {
    private EntryEventType eventType;
    private Entry entry;
    private Long userId;
    private LocalDateTime timestamp;
    private String additionalInfo;

    public static EntryEvent created(Entry entry, Long userId) {
        return EntryEvent.builder()
                .eventType(EntryEventType.ENTRY_CREATED)
                .entry(entry)
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static EntryEvent updated(Entry entry, Long userId) {
        return EntryEvent.builder()
                .eventType(EntryEventType.ENTRY_UPDATED)
                .entry(entry)
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static EntryEvent deleted(Entry entry, Long userId) {
        return EntryEvent.builder()
                .eventType(EntryEventType.ENTRY_DELETED)
                .entry(entry)
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static EntryEvent mediaAdded(Entry entry, Long userId, String mediaInfo) {
        return EntryEvent.builder()
                .eventType(EntryEventType.MEDIA_ADDED_TO_ENTRY)
                .entry(entry)
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .additionalInfo(mediaInfo)
                .build();
    }
}