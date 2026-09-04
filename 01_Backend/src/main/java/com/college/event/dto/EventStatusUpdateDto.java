package com.college.event.dto;

import com.college.event.model.EventStatus;
import jakarta.validation.constraints.NotNull;

public class EventStatusUpdateDto {

    @NotNull(message = "Status is required")
    private EventStatus status;

    public EventStatusUpdateDto() {
    }

    public EventStatusUpdateDto(EventStatus status) {
        this.status = status;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }
}
