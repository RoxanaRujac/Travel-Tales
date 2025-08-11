package com.project.travel.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.project.travel.service.implementation.GeocodingService;

import java.util.Map;

@RestController
@RequestMapping("/map")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Geocoding API", description = "API for forward and reverse geocoding using OpenStreetMap's Nominatim")
public class GeocodingController {

    private final GeocodingService geocodingService;

    @Autowired
    public GeocodingController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @Operation(
            summary = "Forward geocoding",
            description = "Convert location name to geographic coordinates (latitude and longitude)",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successful geocoding",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class, example = "{\"lat\": 40.7128, \"lng\": -74.0060, \"displayName\": \"New York, USA\"}")
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Location parameter is missing or empty"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Location not found"
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Internal server error"
                    )
            }
    )
    @GetMapping("/geocode")
    public ResponseEntity<?> geocodeLocation(
            @Parameter(description = "Location name to geocode (e.g., 'New York')", required = true, example = "New York")
            @RequestParam String location) {

        if (location == null || location.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Location is required")
            );
        }

        try {
            return geocodingService.geocodeLocation(location);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    Map.of("error", "Error processing geocoding request")
            );
        }
    }

    @Operation(
            summary = "Reverse geocoding",
            description = "Convert geographic coordinates to a location name",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successful reverse geocoding",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class, example = "{\"displayName\": \"New York, USA\"}")
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid coordinates"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Location not found for given coordinates"
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Internal server error"
                    )
            }
    )
    @GetMapping("/reverse-geocode")
    public ResponseEntity<?> reverseGeocode(
            @Parameter(description = "Latitude coordinate", required = true, example = "40.7128")
            @RequestParam double lat,
            @Parameter(description = "Longitude coordinate", required = true, example = "-74.0060")
            @RequestParam double lng) {

        try {
            return geocodingService.reverseGeocode(lat, lng);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    Map.of("error", "Error processing reverse geocoding request")
            );
        }
    }
}