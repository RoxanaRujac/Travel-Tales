package com.project.travel.repository;

import com.project.travel.model.Entry;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {
    List<Entry> findByJournalId(Long journalId);
}