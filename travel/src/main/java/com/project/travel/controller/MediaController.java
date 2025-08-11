package com.project.travel.controller;

import com.project.travel.constants.MediaType;
import com.project.travel.model.Media;
import com.project.travel.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @Operation(
            summary = "Get all media",
            description = "Fetches a list of all media in the system"
    )
    @ApiResponse(responseCode = "200", description = "List of media")
    @GetMapping
    public ResponseEntity<List<Media>> getAllMedia() {
        List<Media> mediaList = mediaService.getAllMedia();
        return ResponseEntity.ok(mediaList);
    }

    @Operation(
            summary = "Get media by ID",
            description = "Fetches a media item by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Media found"),
            @ApiResponse(responseCode = "404", description = "Media not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Media> getMediaById(@PathVariable Long id) {
        Optional<Media> media = mediaService.getMediaById(id);
        return media.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Upload a new media file",
            description = "Uploads a new media file and creates a record in the system"
    )
    @ApiResponse(responseCode = "201", description = "Media uploaded and created successfully")
    @PostMapping("/upload")
    public ResponseEntity<Media> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "type", required = false) String type) {

        try {
            String fileUrl = mediaService.saveMediaFile(file);

            MediaType mediaType = (type != null)
                    ? MediaType.valueOf(type)
                    : mediaService.determineMediaType(file.getContentType());

            Media media = Media.builder()
                    .url(fileUrl)
                    .caption(caption)
                    .type(mediaType)
                    .createdAt(java.time.LocalDateTime.now().toString())
                    .build();

            Long mediaId = mediaService.addMedia(media);
            Optional<Media> createdMedia = mediaService.getMediaById(mediaId);

            return createdMedia.map(m -> ResponseEntity.status(HttpStatus.CREATED).body(m))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Delete media",
            description = "Deletes a media item and its file from the system by ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Media deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Media not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id) {
        try {
            Optional<Media> media = mediaService.getMediaById(id);
            if (media.isPresent()) {
                mediaService.deleteMediaFile(media.get().getUrl());
                mediaService.deleteMedia(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}