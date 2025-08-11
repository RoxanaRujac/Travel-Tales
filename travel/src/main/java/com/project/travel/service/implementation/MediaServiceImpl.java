package com.project.travel.service.implementation;

import com.project.travel.constants.MediaType;
import com.project.travel.model.Media;
import com.project.travel.repository.MediaRepository;
import com.project.travel.service.MediaService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private String mediaUploadDir;

    @Override
    public List<Media> getAllMedia() {
        return mediaRepository.findAll();
    }

    @PostConstruct
    public void init() {
        // Get the current working directory and create an absolute path
        String currentDir = System.getProperty("user.dir");
        this.mediaUploadDir = currentDir + "/uploads/media/";

        // Create the directory if it doesn't exist
        File directory = new File(mediaUploadDir);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            System.out.println("Media upload directory created: " + created + " at " + directory.getAbsolutePath());
        }

        System.out.println("Media upload directory: " + directory.getAbsolutePath());
    }


    @Override
    public Optional<Media> getMediaById(Long id) {
        return mediaRepository.findById(id);
    }


    @Override
    public Long addMedia(Media media) {
        return mediaRepository.save(media).getId();
    }

    @Override
    public void deleteMedia(Long id) {
        mediaRepository.deleteById(id);
    }

    @Override
    public String saveMediaFile(MultipartFile file) {
        try {
            // Create a unique filename
            String filename = UUID.randomUUID() + "_" +
                    (file.getOriginalFilename() != null ?
                            file.getOriginalFilename().replaceAll("\\s+", "_") :
                            "unknown");

            // Create the full path
            File directory = new File(mediaUploadDir);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created) {
                    throw new IOException("Failed to create directory: " + directory.getAbsolutePath());
                }
            }

            // Create the file
            File destinationFile = new File(directory, filename);
            System.out.println("Saving file to: " + destinationFile.getAbsolutePath());

            // Save the file using FileOutputStream instead of transferTo
            try (InputStream inputStream = file.getInputStream();
                 FileOutputStream outputStream = new FileOutputStream(destinationFile)) {

                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }

            // Return a web-accessible path
            return "/uploads/media/" + filename;
        } catch (IOException e) {
            System.err.println("Error saving media file: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save file", e);
        }
    }

    @Override
    public void deleteMediaFile(String url) {
        File file = new File(url);
        if (file.exists()) {
            file.delete();
        }
    }

    @Override
    public MediaType determineMediaType(String contentType) {
        if (contentType.startsWith("image")) return MediaType.PHOTO;
        if (contentType.startsWith("video")) return MediaType.VIDEO;
        return null;
    }
}
