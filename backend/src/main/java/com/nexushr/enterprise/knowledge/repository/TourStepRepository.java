package com.nexushr.enterprise.knowledge.repository;

import com.nexushr.enterprise.knowledge.entity.TourStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TourStepRepository extends JpaRepository<TourStep, UUID> {
}
