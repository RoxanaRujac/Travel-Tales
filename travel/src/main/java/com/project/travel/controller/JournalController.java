package com.project.travel.controller;

import com.project.travel.dto.JournalAdditionDTO;
import com.project.travel.mapper.JournalMapper;
import com.project.travel.model.Journal;
import com.project.travel.service.JournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @Operation(
            summary = "Get all journals",
            description = "Returns a list of all journals in the system"
    )
    @ApiResponse(responseCode = "200", description = "List of journals")
    @GetMapping
    public ResponseEntity<List<Journal>> getAllJournals(@RequestParam(required = false) Long userId) {
        @Positive(message = "User ID must be positive")
        List<Journal> journals;

        if (userId != null) {
            journals = journalService.getJournalsByUserId(userId);
        } else {
            journals = journalService.getAllJournals();
        }

        return ResponseEntity.ok(journals);
    }

    @Operation(
            summary = "Get journal by ID",
            description = "Returns a journal by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Journal found"),
            @ApiResponse(responseCode = "404", description = "Journal not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Journal> getJournalById(@PathVariable Long id) {
        @NotNull(message = "Journal ID cannot be null")
        @Positive(message = "Journal ID must be positive")
        Optional<Journal> journal = journalService.getJournalById(id);
        return journal.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Operation(
            summary = "Creates a new journal",
            description = "Creates a new journal in the system for specified user"
    )
    @ApiResponse(responseCode = "201", description = "Successfully created journal")
    @PostMapping
    public ResponseEntity<Journal> createJournal(@RequestBody JournalAdditionDTO journalDTO) {
        // Ensure userId is set
        if (journalDTO.getUserId() == null) {
            return ResponseEntity.badRequest().build();
        }

        System.out.println("Creating journal with userId: " + journalDTO.getUserId());

        Journal journal = JournalMapper.toEntity(journalDTO);
        Journal createdJournal = journalService.addJournal(journal);


        return ResponseEntity.status(HttpStatus.CREATED).body(createdJournal);
    }

    @Operation(
            summary = "Update journal information",
            description = "Updates an existing journal's information"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Journal updated successfully"),
            @ApiResponse(responseCode = "404", description = "Journal not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Journal> updateJournal(@PathVariable Long id, @RequestBody Journal journal) {
        try {
            // check if journal exists
            Optional<Journal> existingJournal = journalService.getJournalById(id);
            if (existingJournal.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // keep userID
            journal.setId(id);
            if (journal.getUserId() == null) {
                journal.setUserId(existingJournal.get().getUserId());
            }

            Journal updatedJournal = journalService.updateJournal(journal);
            return ResponseEntity.ok(updatedJournal);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Deletes a journal",
            description = "Deletes a journal from the system by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Journal deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Journal not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournal(@PathVariable Long id) {
        try {
            journalService.deleteJournal(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Upload a cover image for a journal",
            description = "Uploads a cover image for a specific journal by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully uploaded image"),
            @ApiResponse(responseCode = "404", description = "Journal not found"),
            @ApiResponse(responseCode = "500", description = "Error during image upload")
    })
    @PostMapping("/{id}/upload-cover")
    public ResponseEntity<String> uploadCoverImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String filePath = journalService.uploadCoverImage(id, file);
            return ResponseEntity.ok(filePath);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during uploading: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Get journals by user ID",
            description = "Returns a list of journals for a specific user by their ID"
    )
    @ApiResponse(responseCode = "200", description = "List of journals for the user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Journal>> getJournalsByUserId(@PathVariable Long userId) {
        List<Journal> journals = journalService.getJournalsByUserId(userId);
        return ResponseEntity.ok(journals);
    }
}