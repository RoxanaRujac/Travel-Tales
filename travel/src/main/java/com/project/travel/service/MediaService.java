package com.project.travel.service;

import com.project.travel.constants.MediaType;
import com.project.travel.model.Media;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface MediaService {
    /**
     * Get all media files in the system
     * @return List of all media
     */
    List<Media> getAllMedia();

    /**
     * Get a media file by its ID
     * @param id Media ID
     * @return Optional containing the media if found
     */
    Optional<Media> getMediaById(Long id);

    /**
     * Get all media associated with a specific entry
     * @param entryId Entry ID
     * @return List of media files belonging to the entry
     */
    //List<Media> getMediaByEntryId(Long entryId);

    /**
     * Create a new media record
     * @param media Media object to save
     * @return ID of the saved media
     */
    Long addMedia(Media media);

    /**
     * Delete a media record by ID
     * @param id ID of media to delete
     */
    void deleteMedia(Long id);

    /**
     * Save a media file to storage and return its path
     * @param file Media file to save
     * @return Path of the saved file
     */
    String saveMediaFile(MultipartFile file);

    /**
     * Delete a media file from storage
     * @param url Path of the file to delete
     */
    void deleteMediaFile(String url);

    /**
     * Determine the type of media based on its content type
     * @param contentType Content type of the media file
     * @return MediaType enum value
     */
    MediaType determineMediaType(String contentType);
}