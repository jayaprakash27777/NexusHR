package com.nexushr.enterprise.knowledge.repository;

import com.nexushr.enterprise.knowledge.entity.ProductTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProductTourRepository extends JpaRepository<ProductTour, UUID> {
    @Query("SELECT t FROM ProductTour t LEFT JOIN FETCH t.steps")
    List<ProductTour> findAllWithSteps();
}
