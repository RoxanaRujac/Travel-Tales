package com.project.travel.service.implementation;

import com.project.travel.event.EntryEvent;
import com.project.travel.exceptions.ApiExceptionResponse;
import com.project.travel.model.Entry;
import com.project.travel.model.Journal;
import com.project.travel.model.Media;
import com.project.travel.observer.EmailNotificationObserver;
import com.project.travel.observer.EntryObserver;
import com.project.travel.repository.EntryRepository;
import com.project.travel.repository.MediaRepository;
import com.project.travel.service.EntryService;
import com.project.travel.service.JournalService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class EntryServiceImpl implements EntryService {

    private final EntryRepository entryRepository;
    private final MediaRepository mediaRepository;
    private final JournalService journalService;
    private final EmailNotificationObserver emailObserver;

    // Thread-safe list for observers
    private final List<EntryObserver> observers = new CopyOnWriteArrayList<>();
    @PostConstruct
    public void initObservers() {
        System.out.println("INITIALIZING OBSERVERS...");
        addObserver(emailObserver);
        System.out.println(" Observer setup complete!");
        System.out.println("Total observers registered: " + observers.size());
    }

    @Override
    public void addObserver(EntryObserver observer) {
        observers.add(observer);
        System.out.println("Added observer: " + observer.getObserverName());
    }

    @Override
    public void removeObserver(EntryObserver observer) {
        observers.remove(observer);
        System.out.println("Removed observer: " + observer.getObserverName());
    }

    @Override
    public void notifyObservers(EntryEvent event) {
        for (EntryObserver observer : observers) {
            try {
                observer.onEntryEvent(event);
            } catch (Exception e) {
                System.err.println("Error notifying observer " + observer.getObserverName() + ": " + e.getMessage());
            }
        }
    }

    @Override
    public List<Entry> getAllEntries() {
        return entryRepository.findAll();
    }

    @Override
    public Optional<Entry> getEntryById(Long id) throws ApiExceptionResponse {
        Optional<Entry> entry = entryRepository.findById(id);
        if (entry.isEmpty()) {
            throw ApiExceptionResponse.builder()
                    .message("Entry not found")
                    .status(HttpStatus.NOT_FOUND)
                    .errors(Collections.singletonList("No entry exists with id: " + id))
                    .build();
        }
        return entry;
    }

    @Override
    public List<Entry> getEntriesByJournalId(Long journalId) {
        return entryRepository.findByJournalId(journalId);
    }

    @Override
    public Long addEntry(Entry entry) throws ApiExceptionResponse {
        try {
            if (entry.getTitle() == null || entry.getTitle().trim().isEmpty()) {
                throw ApiExceptionResponse.builder()
                        .message("Entry validation failed")
                        .status(HttpStatus.BAD_REQUEST)
                        .errors(Collections.singletonList("Entry title cannot be empty"))
                        .build();
            }

            if (entry.getJournalId() == null) {
                throw ApiExceptionResponse.builder()
                        .message("Entry validation failed")
                        .status(HttpStatus.BAD_REQUEST)
                        .errors(Collections.singletonList("Journal ID is required"))
                        .build();
            }

            Entry savedEntry = entryRepository.save(entry);

            // Get user ID from journal
            Optional<Journal> journal = journalService.getJournalById(entry.getJournalId());
            Long userId = journal.map(Journal::getUserId).orElse(null);

            // Notify observers
            notifyObservers(EntryEvent.created(savedEntry, userId));

            return savedEntry.getId();
        } catch (Exception e) {
            if (e instanceof ApiExceptionResponse) {
                throw e;
            }

            throw ApiExceptionResponse.builder()
                    .message("Failed to create entry")
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .errors(Collections.singletonList(e.getMessage()))
                    .build();
        }
    }

    @Override
    public Entry updateEntry(Entry entry) throws ApiExceptionResponse {
        try {
            if (!entryRepository.existsById(entry.getId())) {
                throw ApiExceptionResponse.builder()
                        .message("Entry not found")
                        .status(HttpStatus.NOT_FOUND)
                        .errors(Collections.singletonList("No entry exists with id: " + entry.getId()))
                        .build();
            }

            if (entry.getTitle() == null || entry.getTitle().trim().isEmpty()) {
                throw ApiExceptionResponse.builder()
                        .message("Entry validation failed")
                        .status(HttpStatus.BAD_REQUEST)
                        .errors(Collections.singletonList("Entry title cannot be empty"))
                        .build();
            }

            Entry savedEntry = entryRepository.save(entry);

            // Get user ID from journal
            Optional<Journal> journal = journalService.getJournalById(entry.getJournalId());
            Long userId = journal.map(Journal::getUserId).orElse(null);

            // Notify observers
            notifyObservers(EntryEvent.updated(savedEntry, userId));

            return savedEntry;
        } catch (Exception e) {
            if (e instanceof ApiExceptionResponse) {
                throw e;
            }

            throw ApiExceptionResponse.builder()
                    .message("Failed to update entry")
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .errors(Collections.singletonList(e.getMessage()))
                    .build();
        }
    }

    @Override
    @Transactional
    public void addMediaToEntry(Long entryId, Long mediaId) throws ApiExceptionResponse {
        try {
            // Find entry
            Entry entry = entryRepository.findById(entryId)
                    .orElseThrow(() -> ApiExceptionResponse.builder()
                            .message("Entry not found")
                            .status(HttpStatus.NOT_FOUND)
                            .errors(Collections.singletonList("No entry exists with id: " + entryId))
                            .build());

            // Find media
            Media media = mediaRepository.findById(mediaId)
                    .orElseThrow(() -> ApiExceptionResponse.builder()
                            .message("Media not found")
                            .status(HttpStatus.NOT_FOUND)
                            .errors(Collections.singletonList("No media exists with id: " + mediaId))
                            .build());

            // Initialize media attachments if null
            if (entry.getMediaAttachments() == null) {
                entry.setMediaAttachments(new ArrayList<>());
            }

            // Check if media is already associated with the entry
            boolean alreadyAssociated = entry.getMediaAttachments().stream()
                    .anyMatch(m -> m.getId().equals(mediaId));

            if (!alreadyAssociated) {
                // Add media to entry
                entry.getMediaAttachments().add(media);

                // Save updated entry
                entryRepository.save(entry);

                // Get user ID from journal
                Optional<Journal> journal = journalService.getJournalById(entry.getJournalId());
                Long userId = journal.map(Journal::getUserId).orElse(null);

                // Notify observers
                notifyObservers(EntryEvent.mediaAdded(entry, userId, "Media ID: " + mediaId));
            }
        } catch (Exception e) {
            if (e instanceof ApiExceptionResponse) {
                throw e;
            }

            throw ApiExceptionResponse.builder()
                    .message("Failed to associate media with entry")
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .errors(Collections.singletonList(e.getMessage()))
                    .build();
        }
    }

    @Override
    public void deleteEntry(Long id) throws ApiExceptionResponse {
        try {
            // Get entry before deletion for notification
            Optional<Entry> entryOpt = entryRepository.findById(id);
            if (entryOpt.isEmpty()) {
                throw ApiExceptionResponse.builder()
                        .message("Entry not found")
                        .status(HttpStatus.NOT_FOUND)
                        .errors(Collections.singletonList("No entry exists with id: " + id))
                        .build();
            }

            Entry entry = entryOpt.get();

            // Get user ID from journal
            Optional<Journal> journal = journalService.getJournalById(entry.getJournalId());
            Long userId = journal.map(Journal::getUserId).orElse(null);

            entryRepository.deleteById(id);

            // Notify observers
            notifyObservers(EntryEvent.deleted(entry, userId));

        } catch (Exception e) {
            if (e instanceof ApiExceptionResponse) {
                throw e;
            }

            throw ApiExceptionResponse.builder()
                    .message("Failed to delete entry")
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .errors(Collections.singletonList(e.getMessage()))
                    .build();
        }
    }
}