package com.project.travel.observer;

import com.project.travel.event.EntryEvent;
import com.project.travel.model.User;
import com.project.travel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EmailNotificationObserver implements EntryObserver {

    private final UserService userService;

    @Override
    public void onEntryEvent(EntryEvent event) {
        try {
            Optional<User> userOpt = userService.getUserById(event.getUserId());
            if (userOpt.isEmpty()) {
                return;
            }

            User user = userOpt.get();
            String emailContent = generateEmailContent(event, user);


            System.out.println("=== EMAIL NOTIFICATION ===");
            System.out.println("To: " + user.getEmail());
            System.out.println("Subject: " + generateEmailSubject(event));
            System.out.println("Content: " + emailContent);
            System.out.println("========================");

        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }

    private String generateEmailSubject(EntryEvent event) {
        switch (event.getEventType()) {
            case ENTRY_CREATED:
                return "New Journal Entry Created";
            case ENTRY_UPDATED:
                return "Journal Entry Updated";
            case ENTRY_DELETED:
                return "Journal Entry Deleted";
            case MEDIA_ADDED_TO_ENTRY:
                return "Media Added to Journal Entry";
            default:
                return "Journal Activity";
        }
    }

    private String generateEmailContent(EntryEvent event, User user) {
        StringBuilder content = new StringBuilder();
        content.append("Hello ").append(user.getName() != null ? user.getName() : user.getUsername()).append(",\n\n");

        switch (event.getEventType()) {
            case ENTRY_CREATED:
                content.append("You've created a new journal entry: \"")
                        .append(event.getEntry().getTitle())
                        .append("\"");
                if (event.getEntry().getLocationName() != null) {
                    content.append(" at ").append(event.getEntry().getLocationName());
                }
                content.append(".\n\n");
                break;

            case ENTRY_UPDATED:
                content.append("Your journal entry \"")
                        .append(event.getEntry().getTitle())
                        .append("\" has been updated.\n\n");
                break;

            case ENTRY_DELETED:
                content.append("Your journal entry \"")
                        .append(event.getEntry().getTitle())
                        .append("\" has been deleted.\n\n");
                break;

            case MEDIA_ADDED_TO_ENTRY:
                content.append("Media has been added to your journal entry \"")
                        .append(event.getEntry().getTitle())
                        .append("\".\n\n");
                break;
        }

        content.append("Happy journaling!\n");
        content.append("Your Travel Journal Team");

        return content.toString();
    }

    @Override
    public String getObserverName() {
        return "EmailNotificationObserver";
    }
}