package com.project.travel.service.implementation;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate;
    private final String USER_AGENT = "TravelJournal";
    private final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Performs forward geocoding to convert a location name to coordinates
     *
     * @param location The location name to geocode
     * @return ResponseEntity with location data or appropriate error response
     */
    public ResponseEntity<?> geocodeLocation(String location) {
        String url = NOMINATIM_BASE_URL + "/search?q=" +
                location +
                "&format=json&limit=1";

        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<NominatimResponse[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                NominatimResponse[].class
        );

        NominatimResponse[] results = response.getBody();

        if (results != null && results.length > 0) {
            NominatimResponse result = results[0];
            Map<String, Object> locationData = new HashMap<>();
            locationData.put("lat", Double.parseDouble(result.getLat()));
            locationData.put("lng", Double.parseDouble(result.getLon()));
            locationData.put("displayName", result.getDisplay_name());

            return ResponseEntity.ok(locationData);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Performs reverse geocoding to convert coordinates to a location name
     *
     * @param lat Latitude coordinate
     * @param lng Longitude coordinate
     * @return ResponseEntity with location data or appropriate error response
     */
    public ResponseEntity<?> reverseGeocode(double lat, double lng) {
        String url = NOMINATIM_BASE_URL + "/reverse?format=json&lat=" +
                lat + "&lon=" + lng + "&zoom=18";

        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<NominatimReverseResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                NominatimReverseResponse.class
        );

        NominatimReverseResponse result = response.getBody();

        if (result != null) {
            Map<String, Object> locationData = new HashMap<>();
            locationData.put("displayName", result.getDisplay_name());
            return ResponseEntity.ok(locationData);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Creates HTTP headers with appropriate User-Agent for Nominatim API
     *
     * @return HttpHeaders with User-Agent set
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", USER_AGENT);
        return headers;
    }

    // Response model classes for Nominatim API
    public static class NominatimResponse {
        private String lat;
        private String lon;
        private String display_name;

        public String getLat() {
            return lat;
        }

        public void setLat(String lat) {
            this.lat = lat;
        }

        public String getLon() {
            return lon;
        }

        public void setLon(String lon) {
            this.lon = lon;
        }

        public String getDisplay_name() {
            return display_name;
        }

        public void setDisplay_name(String display_name) {
            this.display_name = display_name;
        }
    }

    public static class NominatimReverseResponse {
        private String display_name;

        public String getDisplay_name() {
            return display_name;
        }

        public void setDisplay_name(String display_name) {
            this.display_name = display_name;
        }
    }
}