/*
package com.project.travel.service.implementation;
import com.project.travel.constants.MediaType;
import com.project.travel.model.*;
import com.project.travel.repository.EntryRepository;
import com.project.travel.repository.JournalRepository;
import com.project.travel.repository.MediaRepository;
import com.project.travel.repository.UserRepository;
import com.project.travel.service.MockDataService;
import jakarta.annotation.PostConstruct;
import net.datafaker.Faker;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class MockDataServiceImpl implements MockDataService {
    private final Faker faker = new Faker();
    private final Random random = new Random();

    private final UserRepository userRepository;
    private final JournalRepository journalRepository;
    private final EntryRepository entryRepository;
    private final MediaRepository mediaRepository;


    public MockDataServiceImpl(UserRepository userRepository,
                               JournalRepository journalRepository,
                               EntryRepository entryRepository,
                               MediaRepository mediaRepository) {
        this.userRepository = userRepository;
        this.journalRepository = journalRepository;
        this.entryRepository = entryRepository;
        this.mediaRepository = mediaRepository;
    }

    @PostConstruct
    public void init() {
        // Check if data already exists to prevent duplicate creation
        if (journalRepository.findAll().isEmpty()) {
            generateMockData();
            System.out.println("Mock data initialized:");
            journalRepository.findAll().forEach(journal -> System.out.println(journal.getTitle()));
        } else {
            System.out.println("Mock data already exists, skipping initialization");
        }
    }

    @Override
    public void generateMockData() {
        List<User> users = new ArrayList<>();

        for (int i = 1; i <= 3; i++) {
            User user = new User();
            user.setId((long) i);
            user.setName(faker.name().fullName());
            user.setUsername(faker.internet().userAgentAny());
            user.setEmail(faker.internet().emailAddress());
            user.setPassword(faker.internet().password());
            user.setCreatedAt(faker.date().past(365, java.util.concurrent.TimeUnit.DAYS).toString());

            List<Journal> journals = new ArrayList<>();

            for (int j = 1; j <= 3; j++) {
                Journal journal = new Journal();
                journal.setId((long) (i * 10 + j));
                journal.setTitle(faker.harryPotter().location());
                journal.setCoverImageURL("https://source.unsplash.com/random/800x600/?nature");
                journal.setDescription(faker.harryPotter().quote());
                journal.setCreatedAt(faker.date().past(180, java.util.concurrent.TimeUnit.DAYS).toString());

                List<Entry> entries = new ArrayList<>();

                for (int k = 1; k <= 3; k++) {
                    Entry entry = new Entry();
                    entry.setId((long) (i * 100 + j * 10 + k));
                    entry.setJournal(journal);
                    entry.setTitle(faker.harryPotter().book());
                    entry.setContent(faker.harryPotter().spell());
                    entry.setLocationName(faker.harryPotter().location());
                    entry.setLongitude(faker.address().longitude());
                    entry.setLatitude(faker.address().latitude());
                    entry.setCreatedAt(faker.date().past(30, java.util.concurrent.TimeUnit.DAYS).toString());

                    List<Media> mediaList = new ArrayList<>();
                    for (int m = 1; m <= random.nextInt(3) + 1; m++) {
                        Media media = new Media();
                        media.setId((long) (i * 1000 + j * 100 + k * 10 + m));
                        media.setUrl(faker.internet().image());
                        media.setType(MediaType.values()[random.nextInt(MediaType.values().length)]);
                        media.setCaption(faker.lorem().sentence());
                        media.setCreatedAt(faker.date().past(30, java.util.concurrent.TimeUnit.DAYS).toString());

                        mediaList.add(media);
                    }

                    entry.setMediaAttachments(mediaList);
                    entries.add(entry);
                    mediaRepository.saveAll(mediaList);
                }

                journals.add(journal);
                entryRepository.saveAll(entries);
            }

            user.setJournals(journals);
            users.add(user);
            journalRepository.saveAll(journals);
        }

        userRepository.saveAll(users);
    }

    //@Override
    public List<Journal> getJournals() {
        return journalRepository.findAll();
    }

}*/
