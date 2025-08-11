package com.project.travel.service.implementation;

import com.project.travel.model.Journal;
import com.project.travel.repository.EntryRepository;
import com.project.travel.repository.JournalRepository;
import com.project.travel.service.JournalService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class JournalServiceImpl implements JournalService {

    private final JournalRepository journalRepository;
    private final EntryRepository entryRepository;
    private final String IMAGE_UPLOAD_DIR = "./uploads/journal-covers/";

    @Override
    public Journal addJournal(Journal journal) {
        return journalRepository.save(journal);
    }

    @Override
    public List<Journal> getAllJournals() {
        return journalRepository.findAll();
    }

    @Override
    public Optional<Journal> getJournalById(Long id) {
        return journalRepository.findById(id);
    }

    @Override
    public Journal updateJournal(Journal journal) {
        return journalRepository.save(journal);
    }

    @Override
    public void deleteJournal(Long id) {
        //delete entries
        journalRepository.deleteEntriesByJournalId(id);

        //delete the relationship in user_journals
        journalRepository.deleteUserJournalRelations(id);

        //delete the journal
        journalRepository.deleteById(id);
    }

    @Override
    public String uploadCoverImage(Long journalId, MultipartFile file) throws IOException {
        try {
            // Log the upload attempt
            System.out.println("Attempting to upload cover image for journal " + journalId);
            System.out.println("Original filename: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize() + " bytes");

            // Create a filename with UUID to avoid collisions
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

            // Create absolute paths for both the directory and the file
            String uploadDir = new File("").getAbsolutePath() + "/uploads/journal-covers/";
            File directory = new File(uploadDir);

            // Log directory information
            System.out.println("Upload directory: " + uploadDir);
            System.out.println("Directory exists: " + directory.exists());
            System.out.println("Directory is writable: " + directory.canWrite());

            // Ensure the directory exists
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                System.out.println("Directory created: " + created);
                if (!created) {
                    throw new IOException("Failed to create directory: " + uploadDir);
                }
            }

            // Create the file path and URL
            File destinationFile = new File(directory, filename);
            String webAccessiblePath = "/uploads/journal-covers/" + filename;

            // Log the file path
            System.out.println("Destination file: " + destinationFile.getAbsolutePath());

            // Save the file to disk
            try {
                file.transferTo(destinationFile);
                System.out.println("File successfully saved to: " + destinationFile.getAbsolutePath());
            } catch (Exception e) {
                System.err.println("Error saving file: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }

            // Update the journal with the web-accessible URL
            try {
                Journal journal = journalRepository.findById(journalId)
                        .orElseThrow(() -> new NoSuchElementException("Journal not found with ID: " + journalId));

                journal.setCoverImageURL(webAccessiblePath);
                journalRepository.save(journal);
                System.out.println("Journal " + journalId + " updated with cover image URL: " + webAccessiblePath);

                return webAccessiblePath;
            } catch (Exception e) {
                System.err.println("Error updating journal: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        } catch (Exception e) {
            System.err.println("Error in uploadCoverImage: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public List<Journal> getJournalsByUserId(Long userId) {
        return journalRepository.findByUserId(userId);
    }
}