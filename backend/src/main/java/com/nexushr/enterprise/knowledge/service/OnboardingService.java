package com.nexushr.enterprise.knowledge.service;

import com.nexushr.enterprise.knowledge.dto.ProductTourDto;
import com.nexushr.enterprise.knowledge.dto.TourStepDto;
import com.nexushr.enterprise.knowledge.entity.ProductTour;
import com.nexushr.enterprise.knowledge.entity.TourStep;
import com.nexushr.enterprise.knowledge.repository.ProductTourRepository;
import com.nexushr.enterprise.knowledge.repository.TourStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final ProductTourRepository tourRepository;
    private final TourStepRepository stepRepository;

    @Transactional(readOnly = true)
    public List<ProductTourDto> getAllTours() {
        return tourRepository.findAllWithSteps().stream()
                .map(this::mapToTourDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductTourDto toggleTourStatus(UUID tourId) {
        ProductTour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        tour.setIsActive(!tour.getIsActive());
        return mapToTourDto(tourRepository.save(tour));
    }

    @Transactional
    public ProductTourDto updateTour(UUID tourId, ProductTourDto dto) {
        ProductTour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        tour.setName(dto.getName());
        tour.setDescription(dto.getDescription());
        
        // Update steps
        tour.getSteps().clear();
        if (dto.getSteps() != null) {
            for (int i = 0; i < dto.getSteps().size(); i++) {
                TourStepDto stepDto = dto.getSteps().get(i);
                TourStep step = TourStep.builder()
                        .tour(tour)
                        .title(stepDto.getTitle())
                        .content(stepDto.getContent())
                        .targetSelector(stepDto.getTargetSelector())
                        .stepOrder(i + 1)
                        .build();
                tour.getSteps().add(step);
            }
        }
        
        return mapToTourDto(tourRepository.save(tour));
    }

    private ProductTourDto mapToTourDto(ProductTour tour) {
        return ProductTourDto.builder()
                .id(tour.getId())
                .name(tour.getName())
                .description(tour.getDescription())
                .active(tour.getIsActive())
                .steps(tour.getSteps().stream().map(this::mapToStepDto).collect(Collectors.toList()))
                .build();
    }

    private TourStepDto mapToStepDto(TourStep step) {
        return TourStepDto.builder()
                .id(step.getId())
                .title(step.getTitle())
                .content(step.getContent())
                .targetSelector(step.getTargetSelector())
                .stepOrder(step.getStepOrder())
                .build();
    }
}
