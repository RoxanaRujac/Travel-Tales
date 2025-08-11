package com.project.travel.repository;

import com.project.travel.model.Journal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {
    List<Journal> findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_journals WHERE journals_id = :journalId", nativeQuery = true)
    void deleteUserJournalRelations(@Param("journalId") Long journalId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM entry WHERE journal_id = :journalId", nativeQuery = true)
    void deleteEntriesByJournalId(@Param("journalId") Long journalId);
}