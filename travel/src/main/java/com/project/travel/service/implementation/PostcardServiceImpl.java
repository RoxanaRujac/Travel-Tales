package com.project.travel.service.implementation;

import com.project.travel.model.Postcard;
import com.project.travel.repository.PostcardRepository;
import com.project.travel.service.PostcardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostcardServiceImpl implements PostcardService {

    private final PostcardRepository postcardRepository;

    @Override
    public List<Postcard> getAllPostcards() {
        return postcardRepository.findAll();
    }

    @Override
    public Optional<Postcard> getPostcardById(Long id) {
        return postcardRepository.findById(id);
    }

    @Override
    public Postcard addPostcard(Postcard postcard) {
        return postcardRepository.save(postcard);
    }

    @Override
    public Postcard updatePostcard(Postcard postcard) {
        return postcardRepository.save(postcard);
    }

    @Override
    public void deletePostcard(Long id) {
        postcardRepository.deleteById(id);
    }

    @Override
    public Postcard sendPostcard(Postcard postcard) {
        return postcardRepository.save(postcard);
    }

    @Override
    public List<Postcard> getPostcardsSentByUser(Long senderId) {
        return postcardRepository.findBySenderId(senderId);
    }

    @Override
    public List<Postcard> getPostcardsReceivedByUser(Long receiverId) {
        return postcardRepository.findByReceiverId(receiverId);
    }
}