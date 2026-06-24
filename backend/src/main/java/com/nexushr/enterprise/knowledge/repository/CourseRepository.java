package com.nexushr.enterprise.knowledge.repository;

import com.nexushr.enterprise.knowledge.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
}
