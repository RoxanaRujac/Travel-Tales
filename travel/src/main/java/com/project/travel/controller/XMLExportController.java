package com.project.travel.controller;

import com.project.travel.service.XMLExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@CrossOrigin
@RequestMapping("/export")
@RequiredArgsConstructor
@Validated
public class XMLExportController {

    private final XMLExportService xmlExportService;

    @Operation(
            summary = "Export user profile statistics to XML",
            description = "Generates an XML file containing detailed user statistics including journals, entries, locations, and photos"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "XML export generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid user ID"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "500", description = "Error generating XML export")
    })
    @GetMapping("/user/{userId}/profile-stats")
    public ResponseEntity<ByteArrayResource> exportUserProfileStats(
            @Parameter(description = "User ID", required = true)
            @PathVariable
            @NotNull(message = "User ID cannot be null")
            @Positive(message = "User ID must be positive")
            Long userId) {

        try {
            byte[] xmlData = xmlExportService.exportUserProfileStats(userId);

            // Generate filename with timestamp
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("user_%d_profile_stats_%s.xml", userId, timestamp);

            ByteArrayResource resource = new ByteArrayResource(xmlData);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(xmlData.length))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(
            summary = "Export complete user data to XML",
            description = "Generates a comprehensive XML file containing all user data including profile, journals, entries, and media"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Complete XML export generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid user ID"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "500", description = "Error generating XML export")
    })
    @GetMapping("/user/{userId}/complete-data")
    public ResponseEntity<ByteArrayResource> exportCompleteUserData(
            @Parameter(description = "User ID", required = true)
            @PathVariable
            @NotNull(message = "User ID cannot be null")
            @Positive(message = "User ID must be positive")
            Long userId,

            @Parameter(description = "Include media content in export")
            @RequestParam(defaultValue = "false")
            boolean includeMedia) {

        try {
            byte[] xmlData = xmlExportService.exportCompleteUserData(userId, includeMedia);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("user_%d_complete_data_%s.xml", userId, timestamp);

            ByteArrayResource resource = new ByteArrayResource(xmlData);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(xmlData.length))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(
            summary = "Export journal data to XML",
            description = "Generates an XML file containing data for a specific journal including all its entries and media"
    )
    @GetMapping("/journal/{journalId}")
    public ResponseEntity<ByteArrayResource> exportJournalData(
            @Parameter(description = "Journal ID", required = true)
            @PathVariable
            @NotNull(message = "Journal ID cannot be null")
            @Positive(message = "Journal ID must be positive")
            Long journalId) {

        try {
            byte[] xmlData = xmlExportService.exportJournalData(journalId);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("journal_%d_export_%s.xml", journalId, timestamp);

            ByteArrayResource resource = new ByteArrayResource(xmlData);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(xmlData.length))
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}