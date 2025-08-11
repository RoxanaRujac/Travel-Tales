package com.project.travel.observer;

import com.project.travel.event.EntryEvent;

public interface EntryObserver {
    void onEntryEvent(EntryEvent event);
    String getObserverName();
}