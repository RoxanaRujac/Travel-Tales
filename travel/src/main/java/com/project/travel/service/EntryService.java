package com.project.travel.service;

import com.project.travel.event.EntryEvent;
import com.project.travel.exceptions.ApiExceptionResponse;
import com.project.travel.model.Entry;
import com.project.travel.observer.EntryObserver;

import java.util.List;
import java.util.Optional;

public interface EntryService {
    void addObserver(EntryObserver observer);

    void removeObserver(EntryObserver observer);

    void notifyObservers(EntryEvent event);

    /**
     * Get all entries
     * @return List of all entries
     */
    List<Entry> getAllEntries();

    /**
     * Get an entry by its ID
     * @param id Entry ID
     * @return Optional containing the entry if found
     */
    Optional<Entry> getEntryById(Long id) throws ApiExceptionResponse;

    /**
     * Get all entries for a specific journal
     * @param journalId Journal ID
     * @return List of entries belonging to the journal
     */
    List<Entry> getEntriesByJournalId(Long journalId);

    /**
     * Create a new entry
     * @param entry Entry object to save
     * @return ID of the saved entry
     */
    Long addEntry(Entry entry) throws ApiExceptionResponse;

    /**
     * Update an existing entry
     * @param entry Updated entry data
     * @return Updated entry
     */
    Entry updateEntry(Entry entry) throws ApiExceptionResponse;

    /**
     * Delete an entry by ID
     * @param id ID of entry to delete
     */
    void deleteEntry(Long id) throws ApiExceptionResponse;

    /**
     * Adds a media attachment to an entry
     * @param entryId
     * @param mediaId
     */
    void addMediaToEntry(Long entryId, Long mediaId) throws ApiExceptionResponse;
}