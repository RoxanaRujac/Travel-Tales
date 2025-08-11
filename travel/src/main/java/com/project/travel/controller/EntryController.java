package com.project.travel.controller;

import com.project.travel.exceptions.ApiExceptionResponse;
import com.project.travel.model.Entry;
import com.project.travel.service.EntryService;
import com.project.travel.service.JournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/entries")
@RequiredArgsConstructor
public class EntryController {

    private final EntryService entryService;
    private final JournalService journalService;

    @Operation(
            summary = "Get all entries",
            description = "Returns a list with all entries"
    )
    @ApiResponse(responseCode = "200", description = "Entry list")
    @GetMapping
    public ResponseEntity<List<Entry>> getAllEntries() {
        List<Entry> entries = entryService.getAllEntries();
        return ResponseEntity.ok(entries);
    }

    @Operation(
            summary = "Get entry by ID",
            description = "Returns an entry by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entry found"),
            @ApiResponse(responseCode = "404", description = "Entry not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Entry> getEntryById(@PathVariable Long id) throws ApiExceptionResponse {
        Optional<Entry> entry = entryService.getEntryById(id);
        return entry.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Get entries by journal ID",
            description = "Returns a list of entries by journal ID"
    )
    @ApiResponse(responseCode = "200", description = "Entry list by journal ID")
    @GetMapping("/journal/{journalId}")
    public ResponseEntity<List<Entry>> getEntriesByJournalId(@PathVariable Long journalId) {
        // if the journal exists
        if (journalService.getJournalById(journalId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Entry> entries = entryService.getEntriesByJournalId(journalId);
        return ResponseEntity.ok(entries);
    }

    @Operation(
            summary = "Create a new entry",
            description = "Creates a new entry in the system"
    )
    @ApiResponse(responseCode = "201", description = "Entry created successfully")
    @PostMapping
    public ResponseEntity<Entry> createEntry(@RequestBody Entry entry) throws ApiExceptionResponse {
        // if the journal exists
        if (entry.getJournalId() != null) {
            if (journalService.getJournalById(entry.getJournalId()).isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.badRequest().body(null);
        }

        Long entryId = entryService.addEntry(entry);
        Optional<Entry> createdEntry = entryService.getEntryById(entryId);
        return createdEntry.map(e -> ResponseEntity.status(HttpStatus.CREATED).body(e))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @Operation(
            summary = "Update an entry",
            description = "Updates an existing entry in the system"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entry updated successfully"),
            @ApiResponse(responseCode = "404", description = "Entry not found"),
    })
    @PutMapping("/{id}")
    public ResponseEntity<Entry> updateEntry(@PathVariable Long id, @RequestBody Entry entry) {
        try {
            // if the entry exists
            Optional<Entry> existingEntry = entryService.getEntryById(id);
            if (existingEntry.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // keep original journal ID if not provided otherwise
            entry.setId(id);
            if (entry.getJournalId() == null) {
                entry.setJournalId(existingEntry.get().getJournalId());
            } else {
                // if journal ID is provided, check if it exists
                if (journalService.getJournalById(entry.getJournalId()).isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
            }

            Entry updatedEntry = entryService.updateEntry(entry);
            return ResponseEntity.ok(updatedEntry);
        } catch (NoSuchElementException | ApiExceptionResponse e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Delete an entry",
            description = "Deletes an entry from the system by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Entry deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Entry not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        try {
            entryService.deleteEntry(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException | ApiExceptionResponse e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Associate media with an entry",
            description = "Connects a media item with an entry"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Media associated successfully"),
            @ApiResponse(responseCode = "404", description = "Entry or media not found")
    })
    @PostMapping("/{entryId}/media/{mediaId}")
    public ResponseEntity<Void> addMediaToEntry(
            @PathVariable Long entryId,
            @PathVariable Long mediaId) {
        try {
            // verify entry and media exist
            Optional<Entry> entry = entryService.getEntryById(entryId);
            if (entry.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // associate media with entry
            entryService.addMediaToEntry(entryId, mediaId);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}