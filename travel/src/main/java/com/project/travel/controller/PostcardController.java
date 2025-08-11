package com.project.travel.controller;

import com.project.travel.model.Postcard;
import com.project.travel.service.PostcardService;
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
@RequestMapping("/postcards")
@RequiredArgsConstructor
public class PostcardController {

    private final PostcardService postcardService;

    @Operation(
            summary = "Get all postcards",
            description = "Fetches a list of all postcards in the system"
    )
    @ApiResponse(responseCode = "200", description = "List of postcards")
    @GetMapping
    public ResponseEntity<List<Postcard>> getAllPostcards() {
        List<Postcard> postcards = postcardService.getAllPostcards();
        return ResponseEntity.ok(postcards);
    }

    @Operation(
            summary = "Get postcard by ID",
            description = "Fetches a postcard by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Postcard found"),
            @ApiResponse(responseCode = "404", description = "Postcard not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Postcard> getPostcardById(@PathVariable Long id) {
        Optional<Postcard> postcard = postcardService.getPostcardById(id);
        return postcard.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Get postcards sent by a user",
            description = "Fetches all postcards sent by a specific user"
    )
    @ApiResponse(responseCode = "200", description = "List of postcards sent by the user")
    @GetMapping("/sent/{senderId}")
    public ResponseEntity<List<Postcard>> getPostcardsSentByUser(@PathVariable Long senderId) {
        List<Postcard> postcards = postcardService.getPostcardsSentByUser(senderId);
        return ResponseEntity.ok(postcards);
    }

    @Operation(
            summary = "Get postcards received by a user",
            description = "Fetches all postcards received by a specific user"
    )
    @ApiResponse(responseCode = "200", description = "List of postcards received by the user")
    @GetMapping("/received/{receiverId}")
    public ResponseEntity<List<Postcard>> getPostcardsReceivedByUser(@PathVariable Long receiverId) {
        List<Postcard> postcards = postcardService.getPostcardsReceivedByUser(receiverId);
        return ResponseEntity.ok(postcards);
    }

    @Operation(
            summary = "Create a new postcard",
            description = "Creates a new postcard in the system"
    )
    @ApiResponse(responseCode = "201", description = "Postcard created successfully")
    @PostMapping
    public ResponseEntity<Postcard> createPostcard(@RequestBody Postcard postcard) {
        Postcard createdPostcard = postcardService.addPostcard(postcard);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPostcard);
    }

    @Operation(
            summary = "Send a postcard",
            description = "Sends a postcard from one user to another"
    )
    @ApiResponse(responseCode = "200", description = "Postcard sent successfully")
    @PostMapping("/send")
    public ResponseEntity<Postcard> sendPostcard(@RequestBody Postcard postcard) {
        Postcard sentPostcard = postcardService.sendPostcard(postcard);
        return ResponseEntity.ok(sentPostcard);
    }

    @Operation(
            summary = "Update postcard information",
            description = "Updates an existing postcard's information"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Postcard updated successfully"),
            @ApiResponse(responseCode = "404", description = "Postcard not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Postcard> updatePostcard(@PathVariable Long id, @RequestBody Postcard postcard) {
        try {
            postcard.setId(id);
            Postcard updatedPostcard = postcardService.updatePostcard(postcard);
            return ResponseEntity.ok(updatedPostcard);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Delete a postcard",
            description = "Deletes a postcard from the system by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Postcard deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Postcard not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePostcard(@PathVariable Long id) {
        try {
            postcardService.deletePostcard(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}