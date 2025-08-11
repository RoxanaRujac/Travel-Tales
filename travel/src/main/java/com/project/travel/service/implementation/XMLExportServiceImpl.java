package com.project.travel.service.implementation;
import com.project.travel.model.*;
import com.project.travel.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XMLExportServiceImpl implements XMLExportService {

    private final UserService userService;
    private final JournalService journalService;
    private final EntryService entryService;

    @Override
    public byte[] exportUserProfileStats(Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            User user = userOpt.get();
            List<Journal> journals = journalService.getJournalsByUserId(userId);

            // Calculate statistics
            UserStatistics stats = calculateUserStatistics(userId, journals);

            // Create XML document
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();

            // Root element
            Element root = document.createElement("UserProfileStats");
            root.setAttribute("xmlns", "http://traveljournal.com/schema/profile-stats");
            root.setAttribute("version", "1.0");
            root.setAttribute("exportDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            document.appendChild(root);

            // User information
            Element userInfo = document.createElement("UserInformation");
            root.appendChild(userInfo);

            addTextElement(document, userInfo, "UserId", user.getId().toString());
            addTextElement(document, userInfo, "Username", user.getUsername());
            addTextElement(document, userInfo, "Name", user.getName());
            addTextElement(document, userInfo, "Email", user.getEmail());
            addTextElement(document, userInfo, "JoinDate", user.getCreatedAt());

            // Statistics summary
            Element statisticsElement = document.createElement("Statistics");
            root.appendChild(statisticsElement);

            addTextElement(document, statisticsElement, "TotalJournals", String.valueOf(stats.journalCount));
            addTextElement(document, statisticsElement, "TotalEntries", String.valueOf(stats.entryCount));
            addTextElement(document, statisticsElement, "TotalPhotos", String.valueOf(stats.photoCount));
            addTextElement(document, statisticsElement, "UniqueLocations", String.valueOf(stats.uniqueLocations.size()));

            // Locations list
            Element locationsElement = document.createElement("VisitedLocations");
            statisticsElement.appendChild(locationsElement);
            for (String location : stats.uniqueLocations) {
                addTextElement(document, locationsElement, "Location", location);
            }

            // Journals summary
            Element journalsElement = document.createElement("JournalsSummary");
            root.appendChild(journalsElement);

            for (Journal journal : journals) {
                Element journalElement = document.createElement("Journal");
                journalsElement.appendChild(journalElement);

                addTextElement(document, journalElement, "Id", journal.getId().toString());
                addTextElement(document, journalElement, "Title", journal.getTitle());
                addTextElement(document, journalElement, "Description", journal.getDescription());
                addTextElement(document, journalElement, "CreatedAt", journal.getCreatedAt());

                // Count entries for this journal
                List<Entry> journalEntries = entryService.getEntriesByJournalId(journal.getId());
                addTextElement(document, journalElement, "EntryCount", String.valueOf(journalEntries.size()));
            }

            // Monthly activity
            Element monthlyActivity = document.createElement("MonthlyActivity");
            root.appendChild(monthlyActivity);

            Map<String, Integer> monthlyStats = calculateMonthlyActivity(journals);
            for (Map.Entry<String, Integer> entry : monthlyStats.entrySet()) {
                Element monthElement = document.createElement("Month");
                monthElement.setAttribute("period", entry.getKey());
                monthElement.setTextContent(entry.getValue().toString());
                monthlyActivity.appendChild(monthElement);
            }

            return documentToBytes(document);

        } catch (Exception e) {
            throw new RuntimeException("Error generating XML export", e);
        }
    }

    @Override
    public byte[] exportCompleteUserData(Long userId, boolean includeMedia) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            User user = userOpt.get();
            List<Journal> journals = journalService.getJournalsByUserId(userId);

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();

            // Root element
            Element root = document.createElement("CompleteUserData");
            root.setAttribute("xmlns", "http://traveljournal.com/schema/complete-data");
            root.setAttribute("version", "1.0");
            root.setAttribute("exportDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            document.appendChild(root);

            // User profile
            Element userProfile = document.createElement("UserProfile");
            root.appendChild(userProfile);

            addTextElement(document, userProfile, "UserId", user.getId().toString());
            addTextElement(document, userProfile, "Username", user.getUsername());
            addTextElement(document, userProfile, "Name", user.getName());
            addTextElement(document, userProfile, "Email", user.getEmail());
            addTextElement(document, userProfile, "JoinDate", user.getCreatedAt());

            // Complete journals data
            Element journalsElement = document.createElement("Journals");
            root.appendChild(journalsElement);

            for (Journal journal : journals) {
                Element journalElement = document.createElement("Journal");
                journalsElement.appendChild(journalElement);

                addTextElement(document, journalElement, "Id", journal.getId().toString());
                addTextElement(document, journalElement, "Title", journal.getTitle());
                addTextElement(document, journalElement, "Description", journal.getDescription());
                addTextElement(document, journalElement, "CreatedAt", journal.getCreatedAt());
                addTextElement(document, journalElement, "CoverImageURL", journal.getCoverImageURL());

                // Journal entries
                List<Entry> entries = entryService.getEntriesByJournalId(journal.getId());
                Element entriesElement = document.createElement("Entries");
                journalElement.appendChild(entriesElement);

                for (Entry entry : entries) {
                    Element entryElement = document.createElement("Entry");
                    entriesElement.appendChild(entryElement);

                    addTextElement(document, entryElement, "Id", entry.getId().toString());
                    addTextElement(document, entryElement, "Title", entry.getTitle());
                    addTextElement(document, entryElement, "Content", entry.getContent());
                    addTextElement(document, entryElement, "LocationName", entry.getLocationName());
                    addTextElement(document, entryElement, "Latitude", entry.getLatitude());
                    addTextElement(document, entryElement, "Longitude", entry.getLongitude());
                    addTextElement(document, entryElement, "CreatedAt", entry.getCreatedAt());

                    // Media attachments
                    if (entry.getMediaAttachments() != null && !entry.getMediaAttachments().isEmpty()) {
                        Element mediaElement = document.createElement("MediaAttachments");
                        entryElement.appendChild(mediaElement);

                        for (Media media : entry.getMediaAttachments()) {
                            Element mediaItemElement = document.createElement("Media");
                            mediaElement.appendChild(mediaItemElement);

                            addTextElement(document, mediaItemElement, "Id", media.getId().toString());
                            addTextElement(document, mediaItemElement, "URL", media.getUrl());
                            addTextElement(document, mediaItemElement, "Type", media.getType().toString());
                            addTextElement(document, mediaItemElement, "Caption", media.getCaption());
                            addTextElement(document, mediaItemElement, "CreatedAt", media.getCreatedAt());
                        }
                    }
                }
            }

            return documentToBytes(document);

        } catch (Exception e) {
            throw new RuntimeException("Error generating complete XML export", e);
        }
    }

    @Override
    public byte[] exportJournalData(Long journalId) {
        try {
            Optional<Journal> journalOpt = journalService.getJournalById(journalId);
            if (journalOpt.isEmpty()) {
                throw new RuntimeException("Journal not found with ID: " + journalId);
            }

            Journal journal = journalOpt.get();
            List<Entry> entries = entryService.getEntriesByJournalId(journalId);

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();

            // Root element
            Element root = document.createElement("JournalExport");
            root.setAttribute("xmlns", "http://traveljournal.com/schema/journal");
            root.setAttribute("version", "1.0");
            root.setAttribute("exportDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            document.appendChild(root);

            // Journal information
            Element journalInfo = document.createElement("JournalInformation");
            root.appendChild(journalInfo);

            addTextElement(document, journalInfo, "Id", journal.getId().toString());
            addTextElement(document, journalInfo, "Title", journal.getTitle());
            addTextElement(document, journalInfo, "Description", journal.getDescription());
            addTextElement(document, journalInfo, "CreatedAt", journal.getCreatedAt());
            addTextElement(document, journalInfo, "CoverImageURL", journal.getCoverImageURL());
            addTextElement(document, journalInfo, "UserId", journal.getUserId().toString());

            // Statistics
            Element stats = document.createElement("Statistics");
            journalInfo.appendChild(stats);
            addTextElement(document, stats, "TotalEntries", String.valueOf(entries.size()));

            Set<String> uniqueLocations = entries.stream()
                    .map(Entry::getLocationName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            addTextElement(document, stats, "UniqueLocations", String.valueOf(uniqueLocations.size()));

            int totalPhotos = entries.stream()
                    .mapToInt(entry -> entry.getMediaAttachments() != null ? entry.getMediaAttachments().size() : 0)
                    .sum();
            addTextElement(document, stats, "TotalPhotos", String.valueOf(totalPhotos));

            // Entries
            Element entriesElement = document.createElement("Entries");
            root.appendChild(entriesElement);

            for (Entry entry : entries) {
                Element entryElement = document.createElement("Entry");
                entriesElement.appendChild(entryElement);

                addTextElement(document, entryElement, "Id", entry.getId().toString());
                addTextElement(document, entryElement, "Title", entry.getTitle());
                addTextElement(document, entryElement, "Content", entry.getContent());
                addTextElement(document, entryElement, "LocationName", entry.getLocationName());
                addTextElement(document, entryElement, "Latitude", entry.getLatitude());
                addTextElement(document, entryElement, "Longitude", entry.getLongitude());
                addTextElement(document, entryElement, "CreatedAt", entry.getCreatedAt());

                // Media attachments
                if (entry.getMediaAttachments() != null && !entry.getMediaAttachments().isEmpty()) {
                    Element mediaElement = document.createElement("MediaAttachments");
                    entryElement.appendChild(mediaElement);

                    for (Media media : entry.getMediaAttachments()) {
                        Element mediaItemElement = document.createElement("Media");
                        mediaElement.appendChild(mediaItemElement);

                        addTextElement(document, mediaItemElement, "Id", media.getId().toString());
                        addTextElement(document, mediaItemElement, "URL", media.getUrl());
                        addTextElement(document, mediaItemElement, "Type", media.getType().toString());
                        addTextElement(document, mediaItemElement, "Caption", media.getCaption());
                        addTextElement(document, mediaItemElement, "CreatedAt", media.getCreatedAt());
                    }
                }
            }

            return documentToBytes(document);

        } catch (Exception e) {
            throw new RuntimeException("Error generating journal XML export", e);
        }
    }

    // Helper methods
    private void addTextElement(Document document, Element parent, String tagName, String textContent) {
        Element element = document.createElement(tagName);
        element.setTextContent(textContent != null ? textContent : "");
        parent.appendChild(element);
    }

    private byte[] documentToBytes(Document document) throws Exception {
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        DOMSource source = new DOMSource(document);
        StreamResult result = new StreamResult(outputStream);
        transformer.transform(source, result);

        return outputStream.toByteArray();
    }

    private UserStatistics calculateUserStatistics(Long userId, List<Journal> journals) {
        UserStatistics stats = new UserStatistics();
        stats.journalCount = journals.size();
        stats.uniqueLocations = new HashSet<>();

        for (Journal journal : journals) {
            List<Entry> entries = entryService.getEntriesByJournalId(journal.getId());
            stats.entryCount += entries.size();

            for (Entry entry : entries) {
                if (entry.getLocationName() != null) {
                    stats.uniqueLocations.add(entry.getLocationName());
                }
                if (entry.getMediaAttachments() != null) {
                    stats.photoCount += entry.getMediaAttachments().size();
                }
            }
        }

        return stats;
    }

    private Map<String, Integer> calculateMonthlyActivity(List<Journal> journals) {
        Map<String, Integer> monthlyStats = new TreeMap<>();

        for (Journal journal : journals) {
            if (journal.getCreatedAt() != null) {
                try {
                    LocalDateTime date = LocalDateTime.parse(journal.getCreatedAt());
                    String monthKey = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                    monthlyStats.put(monthKey, monthlyStats.getOrDefault(monthKey, 0) + 1);
                } catch (Exception e) {
                    // Skip invalid dates
                }
            }
        }

        return monthlyStats;
    }

    // Inner class for statistics
    private static class UserStatistics {
        int journalCount = 0;
        int entryCount = 0;
        int photoCount = 0;
        Set<String> uniqueLocations = new HashSet<>();
    }
}