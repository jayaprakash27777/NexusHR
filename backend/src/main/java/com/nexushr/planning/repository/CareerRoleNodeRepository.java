package com.nexushr.planning.repository;

import com.nexushr.planning.model.CareerRoleNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRoleNodeRepository extends JpaRepository<CareerRoleNode, String> {
    List<CareerRoleNode> findByTrackTypeOrderByBaseMinAsc(String trackType);
}
