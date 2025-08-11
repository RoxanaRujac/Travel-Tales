package com.project.travel.service;

import com.project.travel.model.Journal;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface JournalService {
    /**
     * Create a new journal
     * @param journal Journal object to save
     * @return Saved journal with generated ID
     */
    Journal addJournal(Journal journal);

    /**
     * Get all journals in the system
     * @return List of all journals
     */
    List<Journal> getAllJournals();

    /**
     * Get a journal by its ID
     * @param id Journal ID
     * @return Optional containing the journal if found
     */
    Optional<Journal> getJournalById(Long id);

    /**
     * Update an existing journal
     * @param journal Updated journal data
     * @return Updated journal
     */
    Journal updateJournal(Journal journal);

    /**
     * Delete a journal by ID
     * @param id ID of journal to delete
     */
    void deleteJournal(Long id);

    /**
     * Upload a cover image for a journal
     * @param journalId ID of the journal
     * @param file Cover image file to upload
     * @return URL path of the saved image
     * @throws IOException If there is an error during file transfer
     */
    String uploadCoverImage(Long journalId, MultipartFile file) throws IOException;

    /**
     * Get all journals for a specific user by their ID
     * @param userId User ID
     * @return List of journals belonging to the user
     */
    List<Journal> getJournalsByUserId(Long userId);
}