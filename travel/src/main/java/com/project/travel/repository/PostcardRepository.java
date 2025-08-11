package com.project.travel.repository;

import com.project.travel.model.Postcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostcardRepository extends JpaRepository<Postcard, Long> {
    List<Postcard> findBySenderId(Long senderId);

    List<Postcard> findByReceiverId(Long receiverId);
}
