package com.project.travel.service;

import com.project.travel.model.Postcard;

import java.util.List;
import java.util.Optional;

public interface PostcardService {
    /**
     * Get all postcards in the system
     * @return List of all postcards
     */
    List<Postcard> getAllPostcards();

    /**
     * Get a postcard by its ID
     * @param id Postcard ID
     * @return Optional containing the postcard if found
     */
    Optional<Postcard> getPostcardById(Long id);

    /**
     * Create a new postcard
     * @param postcard Postcard object to save
     * @return Saved postcard with generated ID
     */
    Postcard addPostcard(Postcard postcard);

    /**
     * Update an existing postcard
     * @param postcard Updated postcard data
     * @return Updated postcard
     */
    Postcard updatePostcard(Postcard postcard);

    /**
     * Delete a postcard by ID
     * @param id ID of postcard to delete
     */
    void deletePostcard(Long id);

    /**
     * Send a postcard from one user to another
     * @param postcard Postcard to send
     * @return Saved postcard
     */
    Postcard sendPostcard(Postcard postcard);

    /**
     * Get all postcards sent by a specific user
     * @param senderId ID of the sender user
     * @return List of postcards sent by the user
     */
    List<Postcard> getPostcardsSentByUser(Long senderId);

    /**
     * Get all postcards received by a specific user
     * @param receiverId ID of the receiver user
     * @return List of postcards received by the user
     */
    List<Postcard> getPostcardsReceivedByUser(Long receiverId);
}