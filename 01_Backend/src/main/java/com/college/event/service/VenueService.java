package com.college.event.service;

import com.college.event.dto.VenueDto;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.Venue;
import com.college.event.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    @Autowired
    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @Transactional(readOnly = true)
    public List<VenueDto> getAllVenues() {
        return venueRepository.findAll()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VenueDto> getAvailableVenues() {
        return venueRepository.findByAvailableTrue()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VenueDto getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
        return mapToDto(venue);
    }

    @Transactional
    public VenueDto createVenue(VenueDto dto) {
        Venue venue = new Venue(
            dto.getName(),
            dto.getLocation(),
            dto.getCapacity(),
            dto.getAvailable() != null ? dto.getAvailable() : true
        );
        Venue saved = venueRepository.save(venue);
        return mapToDto(saved);
    }

    @Transactional
    public VenueDto updateVenue(Long id, VenueDto dto) {
        Venue venue = venueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));

        venue.setName(dto.getName());
        venue.setLocation(dto.getLocation());
        venue.setCapacity(dto.getCapacity());
        if (dto.getAvailable() != null) {
            venue.setAvailable(dto.getAvailable());
        }

        Venue updated = venueRepository.save(venue);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Venue not found with id: " + id);
        }
        venueRepository.deleteById(id);
    }

    public VenueDto mapToDto(Venue venue) {
        return new VenueDto(
            venue.getId(),
            venue.getName(),
            venue.getLocation(),
            venue.getCapacity(),
            venue.getAvailable()
        );
    }
}
