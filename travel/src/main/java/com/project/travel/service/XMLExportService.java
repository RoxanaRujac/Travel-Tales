package com.project.travel.service;

public interface XMLExportService {
    byte[] exportUserProfileStats(Long userId);
    byte[] exportCompleteUserData(Long userId, boolean includeMedia);
    byte[] exportJournalData(Long journalId);
}