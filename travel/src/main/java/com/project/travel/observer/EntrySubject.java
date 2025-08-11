package com.project.travel.observer;

import com.project.travel.constants.EntryEventType;
import com.project.travel.event.EntryEvent;

public interface EntrySubject {
    void addObserver(EntryObserver observer);
    void removeObserver(EntryObserver observer);
    void notifyObservers(EntryEvent event);
}